"use client";
import { useArweaveMapping } from "@/hooks/use-arweave-mapping";
import Arweave from "arweave";
import { useCallback, useMemo, useState } from "react";
import { ArweaveContext, ArweaveContextInterface } from "./arweaveContext";

export function ArweaveProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => Arweave.init({
    host: "arweave.net",
    port: 443,
    protocol: "https",
  }));
  const arweaveMapping = useArweaveMapping();

  const fetchFile = useCallback(
    async (transactionId: string) => {
      console.log("[Arweave] Fetching file from Arweave...", transactionId);
      const data = await client.transactions.getData(transactionId, {
        decode: true,
        string: false,
      });
      console.log("Fetched file data:", data);
      if (data instanceof Uint8Array) {
        return data.buffer as ArrayBuffer;
      }
      const encoder = new TextEncoder();
      return encoder.encode(data).buffer as ArrayBuffer;
    },
    [client]
  );

  const contextValue = useMemo<ArweaveContextInterface>(() => ({
    fetchFile,
    ...arweaveMapping,
  }), [arweaveMapping, fetchFile])

  return (
    <ArweaveContext.Provider value={contextValue}>
      {children}
    </ArweaveContext.Provider>
  );
}
