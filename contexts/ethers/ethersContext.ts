"use client";
import { errorFunction, networks } from "@/utils/constants";
import { ethers } from "ethers";
import { createContext } from "react";

export interface EthersState {
  currentNetworkId?: string;
  connectStatus: "disconnected" | "connecting" | "connected";
  addresses?: string[];
  currentAccount: string | null;
};

export const initialState: Readonly<EthersState> = {
  connectStatus: "disconnected",
  currentAccount: null,
};

export interface EthersContextInterface extends EthersState {
  requireNetwork: (chainId: keyof typeof networks) => Promise<void>;
  requireProvider: () => Promise<ethers.providers.Web3Provider>;
  changeAddress: (address: string) => void;
  disconnect: () => void;
}

export const ethersContext = createContext<EthersContextInterface>({
  ...initialState,
  requireNetwork: errorFunction,
  requireProvider: errorFunction,
  changeAddress: errorFunction,
  disconnect: errorFunction,
});
