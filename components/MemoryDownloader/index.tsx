"use client";
import { useChat } from "@/contexts/chatContext";
import { downloadFile, handleError } from "@/lib/utils";
import { OrbButtonSmall } from "@/utils/styled";
import { useState } from "react";

export default function MemoryDownloader() {
  const [isDownloading, setIsDownloading] = useState(false);
  const { exportMemory } = useChat();

  const handleDownload = async () => {
    setIsDownloading(true);

    try {
      const data = await exportMemory();
      const fileName = new Date().toISOString().replace(/[:.]/g, '-');
      downloadFile(`${fileName}.snapshot`, data);
      console.log(`Memory exported: ${fileName}`);
    } catch (error) {
      console.error("Error during file download:", error);
      handleError(error, "download memory");
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
