"use client";
import { AccessControlConditions, EncryptResponse } from "@lit-protocol/types";
import { createContext, useContext } from "react";

export interface ArweaveContextInterface {
  fetchFile: (transactionId: string) => Promise<ArrayBuffer>;
  uploadFile: (param: EncryptResponse & {
    condition: AccessControlConditions;
    originalFileName: string;
  }) => Promise<string>;
}

export const ArweaveContext = createContext<ArweaveContextInterface | undefined>(undefined);

export function useArweave() {
  return useContext(ArweaveContext);
}
