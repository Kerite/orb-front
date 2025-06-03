"use client";
import DecryptButton from "../DecryptButton";
import EncryptButton from "../EncryptButton";
import { addToast } from "@heroui/toast";
import { OrbButton } from "@/utils/styled";
import MemoryUploader from "../MemoryUploader";
import MemoryDownloader from "../MemoryDownloader";

interface LastSendMessageBoxProps {
  message: string;
  className?: string;
}

const ChatRecord: React.FC<LastSendMessageBoxProps> = ({
  message,
  className,
}: LastSendMessageBoxProps) => {
  return (
    <div className={`flex w-full flex-col justify-end space-y-[20px] ${className}`}>
      <div className="ml-auto flex gap-2">
        <EncryptButton onUploadFinished={(id) => addToast({ color: "success", title: "Upload success", description: `Arweave TX ID: ${id}` })}>
          {(onOpen) => (
            <OrbButton onClick={onOpen}>
              Share
            </OrbButton>
          )}
        </EncryptButton>
        <DecryptButton>
          {(onOpen) => (
            <OrbButton onClick={onOpen}>
              Decrypt
            </OrbButton>
          )}
        </DecryptButton>
        <MemoryUploader></MemoryUploader>
        <MemoryDownloader></MemoryDownloader>
      </div>
      <div
        className="w-full rounded-[15px] p-[40px]"
        style={{
          background:
            "linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.6) 100%)",
        }}
      >
        <span
          className="text-[26px] font-bold"
          style={{
            letterSpacing: "0em",
          }}
        >
          {message}
        </span>
      </div>
    </div>
  );
}

export default ChatRecord;
