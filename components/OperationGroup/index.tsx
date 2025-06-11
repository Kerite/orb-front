"use client";
import { OrbButtonSmall } from "@/utils/styled";
import MemoryDownloader from "../MemoryDownloader";
import MemoryUploader from "../MemoryUploader";
import EncryptButton from "../ShareMemoryButton";

export default function OperationGroup({ className }: { className?: string }) {
  return (
    <div className={`${className} flex flex-col-reverse justify-center gap-6 sm:flex-row`}>
      <EncryptButton>
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
