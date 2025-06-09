"use client";
import { abi as MemoryMappingAbi } from "@/artifacts/contracts/MemoryMapping.sol/MemoryMapping.json";
import { useEthers } from "@/hooks/use-ethers";
import { BigNumber, ethers } from "ethers";
import { useCallback, useState } from "react";

export interface ArweaveMappingValue {
  address: string;
  memoryId: string;
  price: string;
  description: string;
}

export const useArweaveMapping = () => {
  const { requireProvider, requireNetwork } = useEthers();
  const [bscProvider] = useState(() => new ethers.providers.JsonRpcProvider("https://broken-evocative-surf.bsc-testnet.quiknode.pro/11f750973f8f44ad331023073451c2eaee951114/"));
  const [memoryMappingContract] = useState(() => new ethers.Contract(process.env.NEXT_PUBLIC_ARWEAVE_MAPPING_CONTRACT!, MemoryMappingAbi, bscProvider));

  const getLatestMemories = useCallback(async (): Promise<ArweaveMappingValue[]> => {
    if (!memoryMappingContract) return [];
    const result = await memoryMappingContract.getLatestMemories();
    return result.map((item: { uploader: string, description: string, memoryId: string, price: string }): ArweaveMappingValue => ({
      ...item,
      address: item.uploader
    }));
  }, [memoryMappingContract]);

  const getUserMemories = useCallback(async (address: string): Promise<ArweaveMappingValue[]> => {
    if (!ethers.utils.isAddress(address)) return [];
    const data = await memoryMappingContract.getUserMemories(address);
    return data.map((item: { description: string, memoryId: string, price: string }) => ({
      ...item,
      address
    }));
  }, [memoryMappingContract]);

  const getMemoryAmount = useCallback(async (): Promise<number> => {
    if (!memoryMappingContract) return 0;
    const total = await memoryMappingContract.getTotalRegisteredAddresses() as BigNumber;
    return total.toNumber();
  }, [memoryMappingContract]);

  const addMemoryMapping = useCallback(async (params: Omit<ArweaveMappingValue, 'address'>) => {
    const { memoryId: arweaveId, price, description } = params;
    if (!memoryMappingContract) throw new Error("Arweave mapping contract not initialized");

    const ethProvider = await requireProvider();
    await requireNetwork("bscTestnet");
    const signer = ethProvider.getSigner();
    const contractWithSigner = memoryMappingContract.connect(signer);
    console.log("Calling contract addMemory");
    const resp = await contractWithSigner.addMemory(arweaveId, description, price);
    console.log("addMemory transaction result:", resp);
    return resp;
  }, [memoryMappingContract, requireProvider, requireNetwork]);

  return {
    getLatestMemories,
    getUserMemories,
    getMemoryAmount,
    addMemoryMapping,
  };
}
