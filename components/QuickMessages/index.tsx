import { useChat } from "@/contexts/chatContext";
import { OrbButtonTiny } from "@/utils/styled";
import styled from "styled-components";

const ButtonGroup = styled.div`
  scrollbar-color: #00000040 #0000;
`

const quickMessages = [
  "What do you know?",
]

export default function QuickMessages({
  handleChat,
}: {
  handleChat: (message: string) => void;
}) {
  const { isChating } = useChat();
  return (
    <ButtonGroup className="w-full overflow-x-auto overflow-y-hidden">
      <div className="flex flex-nowrap space-x-2">
        {quickMessages.map((message, index) => (
          <OrbButtonTiny
            key={index}
            className="text-nowrap"
            disabled={isChating}
            onClick={() => handleChat(message)}
            $noGlow
          >
            {message}
          </OrbButtonTiny>
        ))}
      </div>
    </ButtonGroup>
  )
}
