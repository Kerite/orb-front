"use client";
import { FloatTech, OrbButton, Title } from "@/utils/styled";
import Link from "next/link";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  text-align: center;
  z-index: 1;
  position: relative;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  margin-bottom: 3rem;
  opacity: 0.7;
`;

const Enter = styled.div`
  margin-top: 4rem;
  opacity: 0.6;
  animation: ${FloatTech} 3s ease-in-out infinite;
`;

export default function HomePage() {
  return (
    <div className="text-[#D3F4FF]">
      <Container className="overflow-x-hidden">
        <Title>Memory-ORB</Title>
        <Subtitle>Connect to the neural network and awaken your multi-dimensional memory nodes</Subtitle>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link href="/chat">
            <OrbButton>Build Memory</OrbButton>
          </Link>
          <Link href="/memories">
            <OrbButton>Explore Memories</OrbButton>
          </Link>
        </div>
        <Enter>
          Enter the Second World
        </Enter>
      </Container>
    </div>
  );
}
