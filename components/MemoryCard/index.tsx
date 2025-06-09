"use client";
import { useLitProtocol } from "@/contexts/litProtocolContext";
import { ArweaveMappingValue } from "@/hooks/use-arweave-mapping";
import { useEthers } from "@/hooks/use-ethers";
import { OrbButtonMiddle } from "@/utils/styled";
import { addToast, Tooltip } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BalanceRequirement, MemoryCardContainer, MemorySummary, TitleRow } from "./styled";

export default function MemoryCard({ data }: { data: ArweaveMappingValue }) {
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [status, setStatus] = useState("");
  const router = useRouter();
  const { connectStatus } = useEthers();
  const { decryptFile } = useLitProtocol();

  const handleDownload = async () => {
    if (isDecrypting) return;
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
    <MemoryCardContainer>
      <div className="flex flex-wrap items-start justify-between">
        <TitleRow>
          <Tooltip content={data.address} placement="top-start">
            <div className="mb-2 cursor-pointer select-none text-2xl font-bold text-[#5dbae4] underline" onClick={() => router.push(`/creators/${data.address}`)}>
              {data.address.substring(0, 6)}...{data.address.substring(data.address.length - 4)}
            </div>
          </Tooltip>
          <BalanceRequirement>
            <span className="select-none">💰 Download Requirement:</span>
            <span>{data.price}</span>
          </BalanceRequirement>
        </TitleRow>
        <div className="mt-2 flex gap-4">
          <OrbButtonMiddle>Follow</OrbButtonMiddle>
          <OrbButtonMiddle disabled={isDecrypting} onClick={handleDownload}>{isDecrypting ? status : "Download"}</OrbButtonMiddle>
        </div>
      </div>
      <MemorySummary>
        {data.description}
      </MemorySummary>
    </MemoryCardContainer>
  );
}
