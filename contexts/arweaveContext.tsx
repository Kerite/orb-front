"use client";
import { useArweaveMapping } from "@/hooks/use-arweave-mapping";
import { errorFunction } from "@/utils/constants";
import Arweave from "arweave";
import {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";

interface ArweaveContextInterface extends ReturnType<typeof useArweaveMapping> {
  fetchFile: (transactionId: string) => Promise<ArrayBuffer>;
}

const ArweaveContext = createContext<ArweaveContextInterface>({
  fetchFile: errorFunction,
  addMemoryMapping: errorFunction,
  getMemoryAmount: errorFunction,
  getLatestMemories: errorFunction,
  getUserMemories: errorFunction,
});

export function ArweaveProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => Arweave.init({
    host: "arweave.net",
    port: 443,
    protocol: "https",
  }));
  const arweaveMapping = useArweaveMapping();

  const fetchFile = useCallback(
    async (transactionId: string) => {
      console.log("[Arweave] Fetching file from Arweave...", transactionId);
      const data = await client.transactions.getData(transactionId, {
        decode: true,
        string: false,
      });
      console.log("Fetched file data:", data);
      if (data instanceof Uint8Array) {
        return data.buffer as ArrayBuffer;
      }
      const encoder = new TextEncoder();
      return encoder.encode(data).buffer as ArrayBuffer;
    },
    [client]
  );

  return (
    <ArweaveContext.Provider
      value={{
        fetchFile,
        ...arweaveMapping,
      }}
    >
      {children}
    </ArweaveContext.Provider>
  );
}

export function useArweave() {
  return useContext(ArweaveContext);
}
