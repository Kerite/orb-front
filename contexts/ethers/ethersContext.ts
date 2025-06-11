"use client";
import { networks } from "@/utils/constants";
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
  disconnect: () => void;
}

export const ethersContext = createContext<EthersContextInterface | undefined>(undefined);
