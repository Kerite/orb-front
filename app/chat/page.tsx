"use client";
import OperationGroup from "@/components/OperationGroup";
import ChatBox from "@/components/ChatBox/chat-box";
import styled from "styled-components";
import { Title } from "@/utils/styled";

const Container = styled.div`
  max-width: 1000px;
  padding: 4rem 2rem;
  text-align: center;
  position: relative;
`

export default function Home() {
  return (
    <Container className="m-auto lg:ml-[220px]">
      <Title>Build Memories</Title>
      <ChatBox />
      <OperationGroup className="mt-8" />
    </Container>
  );
}
