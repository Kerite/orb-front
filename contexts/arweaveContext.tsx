"use client";
import { useArweaveMapping } from "@/hooks/use-arweave-mapping";
import { errorFunction } from "@/lib/constants";
import Arweave from "arweave";
import { JWKInterface } from "arweave/node/lib/wallet";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface ArweaveContextInterface extends ReturnType<typeof useArweaveMapping> {
  walletAddress?: string;
  balance: string;
  generateKey: () => Promise<void>;
  uploadFile: (data: ArrayBuffer) => Promise<string | undefined>;
  fetchFile: (transactionId: string) => Promise<ArrayBuffer>;
}

const ArweaveContext = createContext<ArweaveContextInterface>({
  balance: "",
  generateKey: errorFunction,
  uploadFile: errorFunction,
  fetchFile: errorFunction,
  addMemoryMapping: errorFunction,
  getMemoryAmount: errorFunction,
  getLatestMemories: errorFunction,
  getUserMemories: errorFunction,
});

export function ArweaveProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => Arweave.init({
    host: "arweave.net",
    port: 443,
    protocol: "https",
  }));

  const [privateKey, setPrivateKey] = useState<JWKInterface | "use_wallet">("use_wallet");
  const [walletAddress, setWalletAddress] = useState<string>();
  const [balance, setBalance] = useState("");
  const arweaveMapping = useArweaveMapping();

  const generateKey = useCallback(async () => {
    const generatedKey = await client.wallets.generate();
    console.log("[Arweave] Generated Key:", generatedKey);
    setPrivateKey(generatedKey);
    localStorage.setItem("arweaveKey", JSON.stringify(generatedKey));
  }, [client]);

  // useEffect(() => {
  //   const storedKey = localStorage.getItem("arweaveKey");
  //   if (storedKey) {
  //     setPrivateKey(JSON.parse(storedKey));
  //   } else {
  //     generateKey();
  //   }
  // }, [generateKey]);

  useEffect(() => {
    if (privateKey !== "use_wallet") {
      client.wallets.jwkToAddress(privateKey).then((address) => {
        setWalletAddress(address);
        console.log("[Arweave] Wallet Address:", address);
      });
    }
  }, [privateKey, client]);

  const updateBalance = useCallback(() => {
    client.wallets.getBalance(walletAddress ?? "").then((balance) => {
      console.log(
        "[Arweave] Wallet Balance:",
        client.ar.winstonToAr(balance),
        "AR"
      );
      setBalance(balance);
    });
  }, [client, walletAddress]);

  const uploadFile = useCallback(
    async (data: ArrayBuffer) => {
      console.log("[Arweave] Uploading file to Arweave...", data);
      console.log("[Arweave] Using key:", privateKey);
      if (!privateKey) {
        console.error("Private key not available");
        throw new Error("Private key not available");
      }
      const transation = await client.createTransaction(
        { data: data },
        privateKey
      );
      await client.transactions.sign(transation, privateKey);
      const res = await client.transactions.post(transation);
      if (res.status === 200) {
        updateBalance();
        return transation.id;
      } else {
        console.error("Transaction failed:", res.statusText);
        throw new Error("Transaction failed");
      }
    },
    [client, privateKey, updateBalance]
  );

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

  useEffect(() => {
    if (walletAddress) {
      updateBalance();
    }
  }, [updateBalance, walletAddress]);

  return (
    <ArweaveContext.Provider
      value={{
        walletAddress,
        balance,
        fetchFile,
        uploadFile,
        generateKey,
        ...arweaveMapping,
      }}
    >
      {children}
    </ArweaveContext.Provider>
  );
}

export function useArweave() {
  return useContext(ArweaveContext);
}
