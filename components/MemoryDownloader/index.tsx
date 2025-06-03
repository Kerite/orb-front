"use client";
import { useChat } from "@/contexts/chatContext";
import { OrbButtonSmall } from "@/utils/styled";
import { useState } from "react";

export default function MemoryDownloader() {
  const [isDownloading, setIsDownloading] = useState(false);
  const { exportMemory } = useChat();

  const handleDownload = async () => {
    setIsDownloading(true);

    try {
      const fileName = await exportMemory();
      console.log(`Memory exported: ${fileName}`);
    } catch (error) {
      console.error("Error during file download:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <OrbButtonSmall
      onClick={handleDownload}
      disabled={isDownloading}
    >
      {isDownloading ? "Downloading..." : "Download Memory"}
    </OrbButtonSmall>
  );
}
