"use client";
import { useEthers } from "@/hooks/use-ethers";
import { LPACC_EVM_BASIC } from "@lit-protocol/accs-schemas";
import { createSiweMessageWithRecaps, generateAuthSig, LitAccessControlConditionResource, LitActionResource } from "@lit-protocol/auth-helpers";
import { LIT_ABILITY, LIT_NETWORK } from "@lit-protocol/constants";
import { LitContracts } from "@lit-protocol/contracts-sdk";
import { encryptFile as litEncryptFile } from "@lit-protocol/encryption";
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { AccessControlConditions, EncryptResponse, LIT_NETWORKS_KEYS, LitResourceAbilityRequest } from "@lit-protocol/types";
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from "react";

interface LitProtocolProviderState {
  status: "disconnected" | "connecting" | "connected";
  error?: Error;
}

const initialState: LitProtocolProviderState = {
  status: "connecting",
};

interface EncryptFileParams {
  file: Blob;
  condition: AccessControlConditions;
  onProcess?: (status: string) => void;
}

interface DecryptFileParams {
  ciphertext: string;
  dataToEncryptHash: string;
  condition: AccessControlConditions;
  onProcess?: (status: string) => void;
}

interface LitProtocolContextInterface extends LitProtocolProviderState {
  litNodeClient?: LitNodeClient;
  switchLitNetwork: (network: LIT_NETWORKS_KEYS) => void;
  encryptFile: (params: EncryptFileParams) => Promise<EncryptResponse>;
  decryptFile: (params: DecryptFileParams) => Promise<Blob>;
}

const LitProtocolContext = createContext<LitProtocolContextInterface>({
  ...initialState,
  switchLitNetwork: () => { },
  encryptFile: () => { throw new Error("encryptFile not implemented"); },
  decryptFile: () => { throw new Error("decryptFile not implemented"); },
});

export type LitProtocolProviderAction =
  | { type: "DISCONNECTED"; error?: Error }
  | { type: "CONNECTED" }
  | { type: "CONNECTING" };

const litProtocolStateReducer = (state: LitProtocolProviderState, action: LitProtocolProviderAction): LitProtocolProviderState => {
  switch (action.type) {
    case "DISCONNECTED":
      return {
        ...state,
        status: "disconnected",
        error: action.error,
      };
    case "CONNECTED":
      return {
        ...state,
        status: "connected",
        error: undefined,
      };
    case "CONNECTING":
      return {
        ...state,
        status: "connecting",
        error: undefined,
      };
    default:
      return state;
  }
}

export function LitProtocolProvider({ children }: { children: React.ReactNode }) {
  const [litNetwork, setLitNetwork] = useState<LIT_NETWORKS_KEYS>(LIT_NETWORK.DatilDev);
  const [litNodeClient, setLitNodeClient] = useState<LitNodeClient>(() => new LitNodeClient({ litNetwork }));
  const { requireProvider, requireNetwork } = useEthers();
  const [state, dispatch] = useReducer(litProtocolStateReducer, initialState);
  // const initialized = useRef(false);
  const [usedBlockchain] = useState<LPACC_EVM_BASIC["chain"]>("sepolia");

  const switchLitNetwork = useCallback(
    (network: LIT_NETWORKS_KEYS) => {
      const newClient = new LitNodeClient({
        litNetwork: network,
      });
      (async () => {
        try {
          dispatch({ type: "CONNECTING" });
          setLitNodeClient(newClient);
          // await newClient.connect();
          dispatch({ type: "CONNECTED" });
        } catch (error) {
          console.error("Lit client connect error:", error);
          dispatch({ type: "DISCONNECTED" });
        }
      })();
    },
    []
  );

  const encryptFile = useCallback<LitProtocolContextInterface["encryptFile"]>(async (params: EncryptFileParams) => {
    const { file, condition, onProcess } = params;
    try {
      onProcess?.("Connecting to Lit Node Client...");
      await litNodeClient.connect();
      onProcess?.("Encrypting file...");
      console.log("Encrypting using condition:", condition);
      const res = await litEncryptFile({
        chain: usedBlockchain,
        file,
        accessControlConditions: condition,
      }, litNodeClient);
      onProcess?.("Encryption complete.");
      return res;
    } catch (error) {
      console.error("Error encrypting file:", error);
      onProcess?.(`Encryption failed: ${error instanceof Error ? error.message : String(error)}`);
      throw new Error(`Encryption failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, [litNodeClient, usedBlockchain]);

  const getSessionSignatures = useCallback(async (condition: AccessControlConditions, onProcess?: (_: string) => void) => {
    const provider = await requireProvider();
    // Connect to the wallet
    await requireNetwork("litTestnet");

    const signer = provider.getSigner();
    console.log("Signer:", signer);
    const walletAddress = await signer.getAddress();
    console.log("Connected account:", walletAddress);

    // Get the latest blockhash
    onProcess?.("Getting latest blockhash...");
    const latestBlockhash = await litNodeClient.getLatestBlockhash();
    console.log("Latest blockhash:", latestBlockhash);

    const contractClient = new LitContracts({
      signer: provider.getSigner(),
      network: LIT_NETWORK.DatilDev,
    });
    onProcess?.("Connecting to Lit contract client...");
    await contractClient.connect();
    onProcess?.("Minting capacity credits NFT...");
    const { capacityTokenIdStr } = await contractClient.mintCapacityCreditsNFT({
      requestsPerKilosecond: 80,
      // requestsPerDay: 14400,
      // requestsPerSecond: 10,
      daysUntilUTCMidnightExpiration: 2,
    });
    console.log("Capacity token ID:", capacityTokenIdStr);

    onProcess?.("Creating capacity delegation auth sig...");
    const { capacityDelegationAuthSig } = await litNodeClient.createCapacityDelegationAuthSig({
      dAppOwnerWallet: signer,
      capacityTokenId: capacityTokenIdStr,
      delegateeAddresses: [await signer.getAddress()],
    });
    console.log("Capacity delegation auth sig:", capacityDelegationAuthSig);

    onProcess?.("Getting session signatures...");
    // Get the session signatures
    const sessionSigs = await litNodeClient.getSessionSigs({
      chain: usedBlockchain,
      resourceAbilityRequests: [
        {
          resource: new LitActionResource('*'),
          ability: LIT_ABILITY.LitActionExecution,
        },
        {
          resource: new LitAccessControlConditionResource('*'),
          ability: LIT_ABILITY.AccessControlConditionDecryption,
        },
      ],
      authNeededCallback: async function (params: {
        uri?: string;
        expiration?: string;
        resourceAbilityRequests?: LitResourceAbilityRequest[]
      }) {
        if (!params.uri) throw new Error("uri is required");
        if (!params.expiration) throw new Error("expiration is required");
        if (!params.resourceAbilityRequests) throw new Error("resourceAbilityRequests is required");

        // Create the SIWE message
        const toSign = await createSiweMessageWithRecaps({
          uri: params.uri,
          expiration: params.expiration,
          resources: params.resourceAbilityRequests,
          walletAddress: await signer.getAddress(),
          nonce: latestBlockhash,
          litNodeClient,
        });

        // Generate the authSig
        const authSig = await generateAuthSig({
          signer: signer,
          toSign,
        });

        return authSig;
      },
      capacityDelegationAuthSig,
    });
    return sessionSigs;
  }, [litNodeClient, usedBlockchain, requireProvider, requireNetwork]);

  const decryptFile = useCallback<LitProtocolContextInterface["decryptFile"]>(async (data: DecryptFileParams): Promise<Blob> => {
    try {
      const { ciphertext, dataToEncryptHash, condition, onProcess } = data;
      if (!ciphertext || !dataToEncryptHash) {
        throw new Error("Invalid data format");
      }
      onProcess?.("Connecting to Lit Node Client...");
      litNodeClient.connect();
      onProcess?.("Decrypting...");
      console.log("Decrypting using condition:", condition);
      const sessionSigs = await getSessionSignatures(condition, onProcess);
      if (!sessionSigs) {
        throw new Error("Genearte Session signatures failed");
      }
      const { decryptedData } = await litNodeClient.decrypt({
        accessControlConditions: condition,
        chain: usedBlockchain,
        ciphertext,
        dataToEncryptHash,
        sessionSigs,
      });
      onProcess?.("Decryption complete.");
      return new Blob([decryptedData], { type: "application/octet-stream" });
    } finally {
      // disconnectWeb3();
    }
  }, [getSessionSignatures, litNodeClient, usedBlockchain]);

  useEffect(() => {
    const newClient = new LitNodeClient({
      litNetwork,
    });
    setLitNodeClient(newClient);
  }, [litNetwork]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        dispatch({ type: "CONNECTING" });
        await litNodeClient.connect();
        if (mounted) {
          dispatch({ type: "CONNECTED" });
        }
      } catch (error) {
        console.error("Lit client connect error:", error);
        if (mounted) {
          dispatch({ type: "DISCONNECTED" });
        }
      }
    })();

    return () => {
      mounted = false;
      try {
        litNodeClient.disconnect?.();
      } catch (error) {
        console.warn("Error disconnecting from Lit client:", error);
      }
    };
  }, [litNodeClient]);

  const contextValue = useMemo<LitProtocolContextInterface>(() => ({
    ...state,
    litNodeClient,
    encryptFile,
    decryptFile,
    switchLitNetwork
  }), [state, litNodeClient, encryptFile, decryptFile, switchLitNetwork])

  return (
    <LitProtocolContext.Provider value={contextValue}>
      {children}
    </LitProtocolContext.Provider>
  );
}

export function useLitProtocol() {
  const context = useContext(LitProtocolContext);
  if (!context) {
    throw new Error("useLitProtocolContext must be used within a LitProtocolProvider");
  }
  return context;
}
