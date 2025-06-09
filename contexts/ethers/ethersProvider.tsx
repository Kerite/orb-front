"use client";
import { shouldAutoConnectWallet } from "@/lib/utils";
import { networks } from "@/utils/constants";
import { addToast } from "@heroui/react";
import { ethers } from "ethers";
import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { ethersContext, EthersContextInterface, EthersState, initialState } from "./ethersContext";

type EthersAction =
  | { action: "CHANGE_NETWORK", networkId: string }
  | { action: "ADDRESS_CHANGES", address: string }
  | { action: "WALLET_CONNECTING" }
  | { action: "WALLET_DISCONNECTED" }
  | { action: "WALLET_CONNECTED", addresses: string[], address: string };

const ethersReducer = (state: EthersState, action: EthersAction): EthersState => {
  switch (action.action) {
    case "CHANGE_NETWORK": {
      return { ...state, currentNetworkId: action.networkId };
    }
    case "ADDRESS_CHANGES": {
      localStorage.setItem("WALLET_CONNECTED", action.address);
      console.log("Address changed to:", action.address);
      return { ...state, currentAccount: action.address };
    }
    case "WALLET_CONNECTING": {
      return { ...state, connectStatus: "connecting" };
    }
    case "WALLET_CONNECTED": {
      localStorage.setItem("WALLET_CONNECTED", action.address);
      console.log("Wallet connected with addresses:", action.addresses);
      return { ...state, connectStatus: "connected", addresses: action.addresses, currentAccount: action.address };
    }
    case "WALLET_DISCONNECTED": {
      localStorage.removeItem("WALLET_CONNECTED");
      console.log("Wallet disconnected");
      return { ...state, connectStatus: "disconnected", currentAccount: null };
    }
    default:
      return state;
  }
}

export const EthersProvider = ({ children }: { children: React.ReactNode }) => {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [state, dispatch] = useReducer(ethersReducer, initialState);

  // 创建和初始化 provider 的函数
  const createProvider = useCallback(() => {
    if (!window.ethereum) return null;
    return new ethers.providers.Web3Provider(window.ethereum, 'any');
  }, []);

  const disconnect = useCallback(() => {
    dispatch({ action: "WALLET_DISCONNECTED" });
  }, []);

  const changeAddress = useCallback((address: string) => {
    dispatch({ action: "ADDRESS_CHANGES", address });
  }, []);

  const requireProvider = useCallback<EthersContextInterface["requireProvider"]>(async () => {
    try {
      if (state.connectStatus === "connected" && provider) {
        console.log("Already connected to wallet");
        return provider;
      }
      if (state.connectStatus === "connecting") {
        throw new Error("Already connecting to wallet");
      }
      dispatch({ action: "WALLET_CONNECTING" });
      if (!window.ethereum) {
        dispatch({ action: "WALLET_DISCONNECTED" });
        throw new Error("No wallet installed");
      }

      let usedProvider: ethers.providers.Web3Provider | null = provider;
      if (!usedProvider) {
        usedProvider = createProvider();
        if (!usedProvider) {
          throw new Error("Failed to create provider");
        }
        setProvider(usedProvider);
      }
      const accounts: string[] = await usedProvider.send("eth_requestAccounts", []);

      if (accounts.length === 0) {
        throw new Error("No accounts found");
      }

      dispatch({
        action: "WALLET_CONNECTED",
        addresses: accounts,
        address: accounts[0]
      });

      return usedProvider;
    } catch (error) {
      console.error("Error connecting to wallet:", error);
      dispatch({ action: "WALLET_DISCONNECTED" });
      throw error;
    }
  }, [provider, state.connectStatus, createProvider]);

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

  useEffect(() => {
    console.log("Initializing Ethers provider...");
    if (window.ethereum) {
      const newProvider = new ethers.providers.Web3Provider(window.ethereum, 'any');
      setProvider(newProvider);

      if (shouldAutoConnectWallet()) {
        (async () => {
          try {
            await requireProvider();
          } catch (error) {
            console.error("Auto-connect failed:", error);
          }
        })();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        dispatch({ action: "WALLET_DISCONNECTED" });
      } else if (state.currentAccount !== accounts[0]) {
        dispatch({ action: "ADDRESS_CHANGES", address: accounts[0] });
      }
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
    };
  }, [state.currentAccount]);

  const contextValue = useMemo<EthersContextInterface>(() => ({
    ...state,
    disconnect,
    changeAddress,
    requireNetwork,
    requireProvider,
  }), [state, disconnect, changeAddress, requireNetwork, requireProvider]);

  return (
    <ethersContext.Provider value={contextValue}>
      {children}
    </ethersContext.Provider>
  );
}
