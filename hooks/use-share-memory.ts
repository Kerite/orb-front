"use client";
import { useLitProtocol } from "@/contexts/litProtocolContext";
import { useArweave } from "@/hooks/use-arweave";
import { validateAccessControlConditionsSchema } from "@lit-protocol/access-control-conditions";
import { AccessControlConditions } from "@lit-protocol/types";

export const useShareMemory = () => {
  const { encryptFile } = useLitProtocol();
  const { addMemoryMapping } = useArweave();

  const executeAsync = async ({
    data,
    fileName,
    condition,
    price,
    description,
  }: {
    data: Blob,
    fileName: string,
    condition: AccessControlConditions,
    price: string,
    description: string,
  }) => {
    const isValidCondition = await validateAccessControlConditionsSchema(condition);
    if (!isValidCondition) {
      throw new Error("Invalid access control conditions");
    } else {
      console.log("Access control conditions are valid:", condition);
    }

    const { ciphertext, dataToEncryptHash } = await encryptFile({ file: data, condition });

    const resp = await fetch("/api/upload", {
      method: "POST",
      body: JSON.stringify({
        ciphertext,
        dataToEncryptHash,
        condition,
        originalFileName: fileName,
      })
    });

    if (!resp.ok) {
      const { error } = await resp.json() as { error: string };
      console.error("Error uploading file:", error);
      throw new Error(error || "Failed to upload file");
    }

    const result: { transactionId?: string } = await resp.json();

    if (!result.transactionId) {
      throw new Error("Failed to upload file");
    }
    console.log("Uploaded file to Arweave...", resp);
    const addMemoryMappingResult = await addMemoryMapping({
      memoryId: result.transactionId,
      price,
      description
    });
    console.log("Memory mapping added:", addMemoryMappingResult);
    return result.transactionId;
  };

  return { executeAsync };
};
