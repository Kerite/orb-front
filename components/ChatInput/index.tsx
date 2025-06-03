"use client";
import { useChat } from "@/contexts/chatContext";
import { FlexDiv, OrbButton } from "@/utils/styled";
import { useState } from "react";
import styled from "styled-components";

export interface MessageInputProps {
  onSend?: (message: string) => Promise<void>;
}

const ChatMessageInput = styled.input`
  flex: 1;
  padding: 0.75rem;
  border-radius: 10px;
  border: none;
  background-color: rgba(255, 255, 255, 0.05);
  color: var(--text-color);
  font-size: 1rem;
`;

const ChatButton = styled(OrbButton)`
  && {
    padding: 0.75rem 1rem;
    border-radius: 10px;
    border: 1px solid var(--accent-color);
    backdrop-filter: blur(4px);
  }
`;

export function MessageInput({ onSend }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const { isChating } = useChat();

  const handleSendMessage = async (message: string) => {
    if (message.trim() === "") return;
    if (onSend) {
      setMessage("");
      await onSend(message);
    }
  }

  return (
    <FlexDiv className="gap-2">
      <ChatMessageInput
        disabled={isChating}
        placeholder={isChating ? "AI is talking" : "Input Message..."}
        type="text"
        onKeyDown={async (e) => {
          if (e.keyCode === 13) {
            handleSendMessage(message);
          }
        }}
        value={message}
        onChange={(e) => setMessage(e.target.value)} />
      <ChatButton disabled={isChating} onClick={() => handleSendMessage(message)}>📤</ChatButton>
    </FlexDiv>
  )
}
