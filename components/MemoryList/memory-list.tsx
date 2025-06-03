"use client";
import { useArweave } from "@/contexts/arweaveContext";
import { ArweaveMappingValue } from "@/hooks/use-arweave-mapping";
import { Title } from "@/utils/styled";
import { useEffect, useState } from "react";
import MemoryCard from "../MemoryCard";
import { addToast, Spinner } from "@heroui/react";

export default function MemoryList({ title, address }: Readonly<{ title?: string, address?: string }>) {
  const [memoryList, setMemoryList] = useState<ArweaveMappingValue[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { getLatestMemories, getUserMemories } = useArweave();

  useEffect(() => {
    setLoading(true);
    if (!address) {
      getLatestMemories()
        .then(data => setMemoryList(data))
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
    <div className="m-auto max-w-[1000px] px-8 py-16">
      <Title>Explore Memories</Title>

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
