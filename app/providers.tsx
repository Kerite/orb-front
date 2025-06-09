"use client";
import SideBar from "@/components/SideBar";
import { ArweaveProvider } from "@/contexts/arweave";
import { ChatProvider } from "@/contexts/chatContext";
import { EthersProvider } from "@/contexts/ethers";
import { LitProtocolProvider } from "@/contexts/litProtocolContext";
import { ToastProvider } from "@heroui/react";
import { HeroUIProvider } from "@heroui/system";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode } from "react";

export default function Providers({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <>
      {pathname !== "/" && <SideBar />}
      <HeroUIProvider navigate={router.push}>
        <ToastProvider />
        <EthersProvider>
          <LitProtocolProvider>
            <ArweaveProvider>
              <ChatProvider>{children}</ChatProvider>
            </ArweaveProvider>
          </LitProtocolProvider>
        </EthersProvider>
      </HeroUIProvider>
    </>
  );
}
