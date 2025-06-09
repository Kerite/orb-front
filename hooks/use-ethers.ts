"use client";
import { ethersContext } from "@/contexts/ethers/ethersContext";
import { useContext } from "react";

export function useEthers() {
  const context = useContext(ethersContext);
  if (!context) {
    throw new Error("useEthers must be used within an EthersProvider");
  }
  return context;
}
