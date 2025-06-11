"use client";
import Arweave from "arweave";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArweaveContext, ArweaveContextInterface } from "./arweaveContext";

const shouldAutoConnectWallet = (): boolean => {
  return Boolean(localStorage.getItem("ARWEAVE_AUTO_CONNECT"));
}

const encoder = new TextEncoder();

export function ArweaveProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => Arweave.init({
    host: "arweave.net",
    port: 443,
    protocol: "https",
  }));
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const uploadFile = useCallback<ArweaveContextInterface["uploadFile"]>(async (data) => {
    const transaction = await client.createTransaction({
      data: encoder.encode(JSON.stringify(data)).buffer as ArrayBuffer,
    }, "use_wallet");
    await client.transactions.sign(transaction, "use_wallet");

    const address = await client.wallets.getAddress("use_wallet");
    console.log("[Arweave] Uploading file to Arweave using address:", address);

    // Check arweave wallet balance before uploading
    // const price = await client.transactions.getPrice(transaction.data.byteLength, "use_wallet");
    // const balance = await client.wallets.getBalance("use_wallet");
    // if (Number(balance) < Number(price)) {
    //   console.error("[Arweave] Insufficient balance to upload file.");
    //   throw new Error(`Insufficient balance to upload file to Arweave. Needs ${price}, but has ${balance}`);
    // }

    const uploader = await client.transactions.getUploader(transaction);

    while (!uploader.isComplete) {
      await uploader.uploadChunk();
      console.log(`${uploader.pctComplete}% complete, ${uploader.uploadedChunks}/${uploader.totalChunks}`);
    }
    if (uploader.lastResponseError) {
      console.error("[Arweave] Upload failed:", uploader.lastResponseError);
      throw new Error(`Failed to upload file to Arweave: ${uploader.lastResponseError}`);
    }
    return transaction.id;
  }, [client]);

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
      return encoder.encode(data).buffer as ArrayBuffer;
    },
    [client.transactions]
  );

  useEffect(() => {
    if (shouldAutoConnectWallet()) {
      (async () => {
        try {
          const address = await client.wallets.jwkToAddress("use_wallet")
          if (address) {
            setWalletAddress(address);
            console.log("[Arweave] Auto-connected wallet address:", address);
          } else {
            console.warn("[Arweave] No wallet address found for auto-connect.");
          }
        } catch (error) {
          console.error("[Arweave] Error auto-connecting wallet:", error);
        }
      })()
    }
  }, [client.wallets]);

  const contextValue = useMemo<ArweaveContextInterface>(() => ({
    walletAddress,
    fetchFile,
    uploadFile,
  }), [fetchFile, uploadFile, walletAddress]);

  return (
    <ArweaveContext.Provider value={contextValue}>
      {children}
    </ArweaveContext.Provider>
  );
}
