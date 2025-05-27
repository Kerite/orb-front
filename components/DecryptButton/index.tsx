"use client";
import { useArweave } from "@/contexts/arweaveContext";
import { useEthers } from "@/contexts/ethersContext";
import { useLitProtocol } from "@/contexts/litProtocolContext";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@heroui/modal";
import { addToast } from "@heroui/toast";
import React, { useState } from "react";

export default function DecryptButton({ children }: { children?: (openModal: () => void) => Readonly<React.ReactNode> }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { connectStatus } = useEthers();
  const { decryptFile } = useLitProtocol();
  const { fetchFile } = useArweave();

  const [arweaveId, setArweaveId] = useState<string>("");
  const [statusText, setStatusText] = useState<string>("");
  const [isDecrypting, setIsDecrypting] = useState<boolean>(false);

  const decode = new TextDecoder("utf-8");

  const handleDownload = async () => {
    try {
      if (connectStatus !== "connected") {
        addToast({ color: "warning", title: "Wallet not connected", description: "Please connect your wallet" });
        return;
      }
      setIsDecrypting(true);
      setStatusText("Fetching from arweave...");
      const fileBuffer = await fetchFile(arweaveId);
      if (!fileBuffer) {
        throw new Error("File not found");
      }
      const data = decode.decode(fileBuffer);
      console.log("Decoded data:", data);
      const { ciphertext, dataToEncryptHash, condition } = JSON.parse(data);
      if (!ciphertext || !dataToEncryptHash) {
        throw new Error("Invalid file format");
      }
      const blob = await decryptFile({
        ciphertext,
        dataToEncryptHash,
        condition,
        onProcess: setStatusText,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "decrypted_file.txt";
      a.click();
      URL.revokeObjectURL(url);
      onClose();
    } catch (error) {
      console.error("Error downloading file:", error);
      addToast({ color: "danger", title: "Export memory failed", description: `${error}` });
    } finally {
      setIsDecrypting(false);
      setStatusText("");
    }
  };

  return (
    <>
      {children?.(onOpen) || (
        <button
          className="w-[122px] h-[34px] rounded-[50px] bg-[rgba(255,255,255,0.7)]"
          onClick={onOpen}
        >
          <span className="font-normal text-[#666666] text-[16px]">Download</span>
        </button>
      )}
      <Modal isOpen={isOpen} onClose={onClose} isDismissable={false}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Download & Decrypt</ModalHeader>
              <ModalBody>
                <Input label="Arweave ID" value={arweaveId} onValueChange={setArweaveId}></Input>
                <span>{statusText}</span>
              </ModalBody>
              <ModalFooter>
                <Button onPress={onClose}>Cancel</Button>
                <Button
                  color="primary"
                  onPress={handleDownload}
                  isLoading={isDecrypting}
                >
                  Download
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
