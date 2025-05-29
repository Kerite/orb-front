"use client";
import styles from "./memorie-card.module.css";
import { OrbButtonMiddle } from "@/utils/styled";
import { useState } from "react";
import { useLitProtocol } from "@/contexts/litProtocolContext";
import { addToast, Tooltip } from "@heroui/react";
import { ArweaveMappingValue } from "@/hooks/use-arweave-mapping";
import { useEthers } from "@/contexts/ethersContext";
import { useRouter } from "next/navigation";

export default function MemoryCard({ data }: { data: ArweaveMappingValue }) {
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [status, setStatus] = useState("");
  const router = useRouter();
  const { connectStatus } = useEthers();
  const { decryptFile } = useLitProtocol();

  const handleDownload = async () => {
    try {
      if (connectStatus !== "connected") {
        addToast({ color: "warning", title: "Wallet not connected", description: "Please connect your wallet" });
        return;
      }
      setIsDecrypting(true);
      setStatus("Fetching");
      const jsonData = await fetch(`https://arweave.net/${data.memoryId}`);
      const jsonText = await jsonData.text();
      const { ciphertext, dataToEncryptHash, condition, originalFileName } = JSON.parse(jsonText);
      if (!ciphertext || !dataToEncryptHash) {
        throw new Error("Invalid file format");
      }
      setStatus("Decrypting");
      const blob = await decryptFile({
        ciphertext,
        dataToEncryptHash,
        condition
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = originalFileName || "decrypted_file.snapshot";
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error decrypting file:", error);
      const { cause } = error as { cause?: { reason: string } };
      addToast({ color: "danger", title: "Export memory failed", description: `${cause?.reason ?? error}` });
    } finally {
      setIsDecrypting(false);
      setStatus("");
    }
  };

  return (
    <div className={styles.memoryCard}>
      <div className="flex justify-between items-start flex-wrap">
        <div className={styles.titleRow}>
          <Tooltip content={data.address} placement="top-start">
            <div className="mb-2 text-2xl text-[#5dbae4] select-none cursor-pointer font-bold underline" onClick={() => router.push(`/creators/${data.address}`)}>
              {data.address.substring(0, 6)}...{data.address.substring(data.address.length - 4)}
            </div>
          </Tooltip>
          <div className={styles.balanceRequirement}>💰 下载条件: {data.price}</div>
        </div>
        <div className="flex gap-4 mt-2">
          <OrbButtonMiddle>Follow</OrbButtonMiddle>
          <OrbButtonMiddle onClick={handleDownload}>{isDecrypting ? status : "Download"}</OrbButtonMiddle>
        </div>
      </div>
      <div className={styles.memorySummary}>{data.description}</div>
    </div>
  );
}
