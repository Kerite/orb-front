"use client";
import { useChat } from "@/contexts/chatContext";
import { useCallback, useEffect, useRef, useState } from "react";
import styled, { keyframes } from "styled-components";
import { MessageInput } from "../ChatInput";
import QuickMessages from "../QuickMessages";

const DialogBox = styled.div`
  width: 80%;
  max-width: 800px;
  background-color: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--accent-color);
  border-radius: 20px;
  padding: 1.5rem;
  backdrop-filter: blur(6px);
  box-shadow: 0 0 10px var(--glow-color);
  margin: auto;
`

const ChatArea = styled.div`
  display: flex;
  flex-direction: column;
  height: 300px;
  overflow-y: auto;
  padding: 1rem;
  background-color: rgba(255, 255, 255, 0.02);
  border-radius: 10px;
  text-align: left;
  gap: 0.5rem;
  scrollbar-color: #00000040 #0000;
`

const Message = styled.p`
  font-size: 0.95rem;
  color: var(--text-color);
`

const blinkAnimation = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
`;

const Cursor = styled.span`
  display: inline-block;
  width: 2px;
  height: 1em;
  background-color: var(--text-color);
  margin-left: 2px;
  vertical-align: text-bottom;
  animation: ${blinkAnimation} 1s step-end infinite;
`;

export default function ChatBox() {
  const [reply, setReply] = useState<{ content: string }>({ content: "" });
  const { records, sendMessage, isChating } = useChat();
  const messageEndRef = useRef<HTMLDivElement>(null);

  const handleChat = useCallback(async (message: string) => {
    setReply({ content: "" });
    await sendMessage({
      message,
      onChunk: (chunk) => {
        setReply((oldReply) => {
          if (oldReply.content === "") {
            return {
              content: chunk,
            };
          }
          return {
            content: `${oldReply.content}${chunk}`,
          };
        });
      },
      onDone: () => {
        setReply({ content: "" });
      },
    })
  }, [sendMessage]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [reply]);

  return (
    <DialogBox className="flex flex-col gap-2">
      <ChatArea>
        {records.map((record, index) => (
          <Message key={index}>
            <strong>{record.role === "user" ? "User" : "AI"}:</strong> {record.content}
          </Message>
        ))}
        {isChating && (
          <Message>
            <strong>AI:</strong> {reply.content}<Cursor />
          </Message>
        )}
        <div ref={messageEndRef}></div>
      </ChatArea>
      <QuickMessages handleChat={handleChat} />
      <MessageInput onSend={handleChat} />
    </DialogBox>
  )
}
