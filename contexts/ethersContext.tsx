"use client";
import { ethers } from "ethers";
import { createContext, useCallback, useContext, useEffect, useReducer, useState } from "react";
import { addToast } from "@heroui/react";
import { errorFunction, networks } from "@/lib/constants";

interface EthersState {
  currentNetworkId?: string;
  connectStatus: "disconnected" | "connecting" | "connected";
  walletAddress: string | null;
};

const initialState: EthersState = {
  connectStatus: "disconnected",
  walletAddress: null,
};

interface EthersContext extends EthersState {
  requireNetwork: (chainId: keyof typeof networks) => Promise<void>;
  requireProvider: () => Promise<ethers.providers.Web3Provider>;
}

const ethersContext = createContext<EthersContext>({
  ...initialState,
  requireNetwork: errorFunction,
  requireProvider: errorFunction,
});

type EthersAction =
  | { action: "CHANGE_NETWORK", networkId: string }
  | { action: "ADDRESS_CHANGES", address: string }
  | { action: "WALLET_CONNECTING" }
  | { action: "WALLET_DISCONNECTED" }
  | { action: "WALLET_CONNECTED", address: string };

const ethersReducer = (state: EthersState, action: EthersAction): EthersState => {
  switch (action.action) {
    case "CHANGE_NETWORK":
      return { ...state, currentNetworkId: action.networkId };
    case "ADDRESS_CHANGES":
      return { ...state, walletAddress: action.address };
    case "WALLET_CONNECTING":
      return { ...state, connectStatus: "connecting" };
    case "WALLET_CONNECTED":
      return { ...state, connectStatus: "connected", walletAddress: action.address };
    case "WALLET_DISCONNECTED":
      return { ...state, connectStatus: "disconnected", walletAddress: null };
    default:
      return state;
  }
}

export const EthersProvider = ({ children }: { children: React.ReactNode }) => {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider>();
  const [state, dispatch] = useReducer(ethersReducer, initialState);

  useEffect(() => {
    console.log("Initializing Ethers provider...");
    if (window.ethereum) {
      setProvider(new ethers.providers.Web3Provider(window.ethereum, 'any'));
    }
  }, []);

  const requireProvider = useCallback(
    async () => {
      if (state.connectStatus === "connecting") {
        throw new Error("Already connecting to wallet");
      }
      dispatch({ action: "WALLET_CONNECTING" });
      if (!window.ethereum) {
        dispatch({ action: "WALLET_DISCONNECTED" });
        throw new Error("No wallet installed");
      }
      let usedProvider = provider;
      if (!usedProvider) {
        usedProvider = new ethers.providers.Web3Provider(window.ethereum, 'any');
        setProvider(usedProvider);
      }
      const accounts = await usedProvider.send("eth_requestAccounts", []);
      console.log("Web3 Accounts:", accounts);
      dispatch({ action: "WALLET_CONNECTED", address: accounts[0] });
      return usedProvider;
    },
    [provider, state.connectStatus],
  );

  const requireNetwork = useCallback(async (chainKey: keyof typeof networks) => {
    if (!provider) {
      throw new Error("Provider not initialized");
    }
    const { chainId: currentChainId } = await provider.getNetwork();
    const { chainId: targetChainId } = networks[chainKey];
    if (ethers.utils.hexValue(targetChainId) !== ethers.utils.hexValue(currentChainId)) {
      addToast({ title: `Switching network to ${networks[chainKey].chainName}` });
      try {
        await provider.send("wallet_switchEthereumChain", [{ chainId: ethers.utils.hexValue(targetChainId) }]);
      } catch (error) {
        const { code: errorCode } = error as { code: number };
        if (errorCode === 4902) {
          await provider.send("wallet_addEthereumChain", [networks[chainKey]]);
        } else {
          throw error;
        }
      }
    }
  }, [provider]);

  return (
    <ethersContext.Provider value={{
      ...state,
      requireNetwork,
      requireProvider,
    }}>
      {children}
    </ethersContext.Provider>
  );
}

export function useEthers() {
  const context = useContext(ethersContext);
  if (!context) {
    throw new Error("useEthers must be used within an EthersProvider");
  }
  return context;
}
