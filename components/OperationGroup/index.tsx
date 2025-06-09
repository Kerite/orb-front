"use client";
import { OrbButtonSmall } from "@/utils/styled";
import { addToast } from "@heroui/react";
import MemoryDownloader from "../MemoryDownloader";
import MemoryUploader from "../MemoryUploader";
import EncryptButton from "../ShareMemoryButton";

export default function OperationGroup({ className }: { className?: string }) {
  return (
    <div className={`${className} flex flex-col-reverse justify-center gap-6 sm:flex-row`}>
      <EncryptButton onUploadFinished={(id) => addToast({ color: "success", title: "Upload success", description: `Arweave TX ID: ${id}` })}>
        {(onOpen) => (
          <OrbButtonSmall onClick={onOpen}>
            Share Memory
          </OrbButtonSmall>
        )}
      </EncryptButton>
      <MemoryUploader></MemoryUploader>
      <MemoryDownloader></MemoryDownloader>
    </div>
  );
}
