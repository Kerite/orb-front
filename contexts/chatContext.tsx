import { ChatRecord } from "@/types";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

interface SendMessageParams {
  message: string,
  onChunk?: (chunk: string) => void,
  onDone?: () => void,
  onError?: (error: Error) => void
}

const FingerPrintContext = createContext<{
  fingerprint: string;
  records: Readonly<ChatRecord>[];
  isChating: boolean;
  sendMessage: (params: Readonly<SendMessageParams>) => Promise<void>;
  exportMemory: () => Promise<Blob>;
  importMemory: (file: File) => Promise<void>;
}>({
  fingerprint: "",
  records: [],
  isChating: false,
  sendMessage: async () => { throw new Error("Not implemented"); },
  exportMemory: async () => { throw new Error("Not implemented"); },
  importMemory: async () => { throw new Error("Not implemented"); },
});

export const ChatProvider = ({
  children
}: Readonly<{
  children: React.ReactNode
}>) => {
  const [fingerprint, setFingerprint] = useState<string>("");
  const [records, setRecords] = useState<Readonly<{
    role: "ai" | "user";
    content: string;
  }>[]>([]);
  const [isChating, setIsChating] = useState(false);

  useEffect(() => {
    const loadFp = async () => {
      const fingerprint = await FingerprintJS.load();
      const { visitorId } = await fingerprint.get();

      setFingerprint(visitorId);
    }
    loadFp();
  }, []);

  const sendMessage = useCallback(async ({
    message,
    onChunk,
    onDone,
    onError,
  }: Readonly<SendMessageParams>): Promise<void> => {
    try {
      if (isChating) {
        console.warn("Already in a chat session, ignoring new message.");
        return;
      }
      setIsChating(true);
      setRecords((oldRecords) => [...oldRecords, { role: "user", content: message }]);
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chat`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify({
          message,
          user_id: fingerprint,
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("AI response failed:", errorText);
        throw new Error(`Chat request failed: ${response.statusText}`);
      }

      // 处理服务器发送的事件流
      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");

      if (!reader) {
        throw new Error("No readable stream available");
      }

      let resp = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data:')) {
            try {
              const data = JSON.parse(line.slice(5).trim());

              if (data.content) {
                resp += data.content;
                onChunk?.(data.content);
              }

              if (data.done) {
                setRecords((oldRecords) => [...oldRecords, { role: "ai", content: resp }]);
                setIsChating(false);
                console.log("AI response completed");
                onDone?.();
                return;
              }

              if (data.error) {
                throw new Error(data.error);
              }
            } catch (parseError) {
              console.warn("Error parsing SSE data:", parseError);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error in streaming chat:", error);
      onError?.(error instanceof Error ? error : new Error(String(error)));
    } finally {
      setIsChating(false);
    }
  }, [fingerprint, isChating]);

  const exportMemory = useCallback(async (): Promise<Blob> => {
    try {
      const userId = fingerprint;
      console.log(`Starting memory snapshot export for user: ${userId}...`);
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/export-memory`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Accept': 'application/octet-stream',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId
        })
      });

      console.log("Received response:", response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Export failed:", errorText);
        throw new Error(`Export failed: ${response.statusText}`);
      }

      const blob = await response.blob();

      return blob;
    } catch (error) {
      console.error("Memory export failed:", error);
      throw error;
    }
  }, [fingerprint])

  const importMemory = useCallback(async (file: File): Promise<void> => {
    try {
      const userId = fingerprint;
      console.log(`Starting file upload for user ${userId}:`, file.name, file.size, "bytes");
      const formData = new FormData();
      formData.append('snapshot', file);
      formData.append('user_id', userId);

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/import-memory`, {
        method: 'POST',
        mode: 'cors',
        body: formData,
      });

      console.log("Import response:", response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Import failed:", errorText);
        throw new Error(`Import failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("Import successful:", result);
      return result;
    } catch (error) {
      console.error("Memory import failed:", error);
      throw error;
    }
  }, [fingerprint]);

  const contextValue = useMemo(() => ({
    fingerprint,
    records,
    isChating,
    sendMessage,
    exportMemory,
    importMemory
  }), [fingerprint, records, isChating, sendMessage, exportMemory, importMemory]);

  return (
    <FingerPrintContext.Provider value={contextValue}>
      {children}
    </FingerPrintContext.Provider>
  )
}

export const useChat = () => {
  const context = useContext(FingerPrintContext);
  if (!context) {
    throw new Error("useChat() must be used within a FingerprintProvider");
  }
  return context;
}

export const useExportMemory = () => {
  const { exportMemory } = useChat();
  return {
    exportMemory
  };
}
