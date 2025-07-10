"use client";
import { ArweaveMappingValue, useMemoryMappingContract } from "@/hooks/use-arweave-mapping";
import { Title } from "@/utils/styled";
import { addToast, Spinner } from "@heroui/react";
import { useEffect, useState } from "react";
import MemoryCard from "../MemoryCard";

export default function MemoryList({ title, address }: Readonly<{ title?: string, address?: string }>) {
  const [memoryList, setMemoryList] = useState<ArweaveMappingValue[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { getLatestMemories, getUserMemories } = useMemoryMappingContract();

  useEffect(() => {
    setLoading(true);
    if (!address) {
      getLatestMemories()
        .then(data => setMemoryList(data.filter(d => {
          return d.description !== ""
        }).slice(-10).reverse()))
        .catch((error) => addToast({ title: "Load memory list failed", description: `${error}`, color: "danger" }))
        .finally(() => setLoading(false));
    } else {
      getUserMemories(address)
        .then(data => setMemoryList(data))
        .catch((error) => addToast({ title: "Load memory list failed", description: `${error}`, color: "danger" }))
        .finally(() => setLoading(false));
    }
  }, [getLatestMemories, getUserMemories, address]);

  return (
    <div className="m-auto flex max-w-[1000px] flex-col gap-8 px-8 py-16">
      <Title className="font-orbitron text-7xl">Explore Memories</Title>

      {loading ? (
        <div className="flex min-h-[50vh] items-center justify-center">
          <Spinner />
        </div>
      ) : memoryList.length > 0 ? (
        <>
          {memoryList.map((memory, index) => (
            <MemoryCard data={memory} key={`memory-${index}`} />
          ))}
        </>
      ) : (
        <div className="px-12 text-center text-xl">
          <p>No Memory Data</p>
        </div>
      )}
    </div>
  )
}
