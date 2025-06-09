"use client";
import { useArweaveMapping } from "@/hooks/use-arweave-mapping";
import { errorFunction } from "@/utils/constants";
import { createContext } from "react";

export interface ArweaveContextInterface extends ReturnType<typeof useArweaveMapping> {
  fetchFile: (transactionId: string) => Promise<ArrayBuffer>;
}

export const ArweaveContext = createContext<ArweaveContextInterface>({
  fetchFile: errorFunction,
  addMemoryMapping: errorFunction,
  getMemoryAmount: errorFunction,
  getLatestMemories: errorFunction,
  getUserMemories: errorFunction,
});
