"use client";
import { useChat } from "@/contexts/chatContext";
import { OrbButtonSmall } from "@/utils/styled";
import { useState } from "react";

export default function MemoryUploader({ children }: { children?: (isLoading: boolean) => Readonly<React.ReactNode> }) {
  const [isLoading, setIsLoading] = useState(false); // Assuming you have a hook to get the loading state
  const { importMemory } = useChat();

  const handleLoadMemory = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setIsLoading(true);

    try {
      console.log("Loading memory...");
      const file = event.target.files?.[0];
      if (!file) {
        throw new Error("No file selected");
      }
      await importMemory(file);
      console.log("File uploaded successfully:", file.name, file.size, "bytes");
    } catch {
    } finally {
      setIsLoading(false);
      if (event.target) event.target.value = "";
    }
  };

  return children?.(isLoading) || (
    <OrbButtonSmall
      onClick={() => {
        document.getElementById("memory-load")?.click();
      }}
      disabled={isLoading}
    >
      <input
        id="memory-load"
        type="file"
        hidden
        accept=".snapshot"
        onChange={handleLoadMemory}
      />
      {isLoading ? "Loading..." : "Load Memory"}
    </OrbButtonSmall>
  )
}
