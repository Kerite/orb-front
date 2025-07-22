import { useChat } from "@/contexts/chatContext";
import { OrbButtonSmall } from "@/utils/styled";
import { addToast } from "@heroui/react";

export function MemoryClear() {
  const { clearMemory } = useChat();

  const handleClearMemory = async () => {
    try {
      await clearMemory();
      addToast({ title: "Memory Cleared", color: "success" });
    } catch (error) {
      addToast({ title: "Memory clear failed", color: "danger", description: `${error}` });
    }
  }

  return (
    <OrbButtonSmall onClick={handleClearMemory}>
      Clear Memory
    </OrbButtonSmall>
  )
}
