"use client";
import { Button } from "@heroui/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";
import React, { useState } from "react";
import AccessControlConditionsEditor from "./access-condition-editor";
import { AccessControlConditions } from "@lit-protocol/types";
import { useArweave } from "@/contexts/arweaveContext";
import { useLitProtocol } from "@/contexts/litProtocolContext";
import { addToast, Divider, Input } from "@heroui/react";
import { useEthers } from "@/contexts/ethersContext";
import { DEFAULT_CONDITION } from "@/lib/constants";

interface UploadButtonProps {
  onUploadFinished?: (arweaveTransId: string) => void;
  children?: (onOpen: () => void) => Readonly<React.ReactNode>;
}

const EncryptButton: React.FC<UploadButtonProps> = ({ onUploadFinished, children }) => {
  const [condition, setCondition] = useState<AccessControlConditions>([DEFAULT_CONDITION]);
  const [isUploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { connectStatus } = useEthers();
  const { addMemoryMapping, uploadFile } = useArweave();
  const { encryptFile } = useLitProtocol();

  const encoder = new TextEncoder();

  const handleUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setUploading(true);

    try {
      // Encrypt
      const file = event.target?.files?.[0];
      if (!file) {
        throw new Error("No file selected");
      }

      console.log("Uploading using conditions", condition);

      const { ciphertext, dataToEncryptHash } = await encryptFile({ file, condition });

      // Upload to arweave
      const uint8Array = encoder.encode(
        JSON.stringify({
          ciphertext,
          dataToEncryptHash,
          condition: condition,
          originalFileName: file.name,
        })
      );
      setStatusMessage("Uploading...");
      const arweaveTransId = await uploadFile(uint8Array.buffer as ArrayBuffer);
      if (arweaveTransId) {
        setStatusMessage(`Uploaded arweave id: ${arweaveTransId}, sharing...`);
        await addMemoryMapping({
          memoryId: arweaveTransId,
          price: price,
          description: description,
        });
        addToast({ color: "success", title: "Share successfully" });
        onUploadFinished?.(arweaveTransId);
      } else {
        throw new Error("Upload result is empty");
      }
    } catch (error) {
      console.error("Error during file upload:", error);
      const { cause: errorCause } = error as { cause?: { message: string } };
      addToast({ title: "Upload failed", description: errorCause?.message ?? `${error}`, color: "danger" });
      setStatusMessage("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleOpenModal = () => {
    if (connectStatus !== "connected") {
      addToast({ color: "warning", title: "Wallet not connected", description: "Please connect your wallet" });
      return;
    }
    onOpen();
  }

  return (
    <>
      {
        children?.(handleOpenModal) ?? (
          <button
            className="w-[122px] h-[34px] rounded-[50px] bg-[rgba(255,255,255,0.7)]"
            onClick={handleOpenModal}
            disabled={isUploading}
          >
            <span className="font-normal text-[#666666] text-[16px]">
              {isUploading ? "Uploading" : "Upload"}
            </span>
          </button>
        )
      }
      <Modal isOpen={isOpen} onClose={onClose} isDismissable={false} scrollBehavior="inside" size="4xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="select-none">Encrypt & Upload Memory</ModalHeader>
              <ModalBody>
                <Input label="Description" placeholder="(eg. My favorite movie)" value={description} onValueChange={setDescription} />
                <Input label="Requirement" placeholder="(eg. Balance >0.01 ETH, or Azuki NFT > 0)" value={price} onValueChange={setPrice} />
                <Divider />
                <AccessControlConditionsEditor value={condition} onChange={(newCondition) => { setCondition(newCondition) }} />
                <input
                  id="memory-upload"
                  type="file"
                  hidden
                  accept=".snapshot"
                  onChange={handleUpload}
                />
              </ModalBody>
              <ModalFooter>
                <span>{statusMessage}</span>
                {/* <Button onPress={() => setAdvancedMode(oldValue => !oldValue)}>Advanced</Button> */}
                <Button onPress={onClose} disabled={isUploading}>Cancel</Button>
                <Button
                  color="primary"
                  isLoading={isUploading}
                  onPress={() => document.getElementById("memory-upload")?.click()}
                >
                  Upload
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}

export default EncryptButton;
