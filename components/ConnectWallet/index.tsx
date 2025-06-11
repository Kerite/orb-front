"use client";
import { useLitProtocol } from "@/contexts/litProtocolContext";
import { useEthers } from "@/hooks/use-ethers";
import { OrbButtonTiny } from "@/utils/styled";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";

const WalletButtonContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 30px;
  user-select: none;
  z-index: 999;
`;

const WalletButton = styled.div`
  position: relative;
  display: inline-block;
`;

const WalletButtonTrigger = styled.button`
  padding: 8px 16px;
  border: 1px solid var(--accent-color);
  border-radius: 20px;
  background-color: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(5px);
  color: var(--text-color);
  cursor: pointer;
  z-index: 2;
  transition: 0.3s;
  &:hover {
    background-color: var(--accent-color);
    color: #0A0F1A;
  }
`;

const DropdownContainer = styled(motion.div)`
  display: absolute;
  border: 1px solid var(--accent-color);
  border-radius: 20px;
  padding: 12px;
  color: var(--text-color);
  margin-top: 10px;
`;

const ConnectWalletButton = () => {
  const { connectStatus, currentAccount } = useEthers();

  const comp = useMemo(() => {
    switch (connectStatus) {
      case "disconnected":
        return <span>🔗 Connect Wallet</span>;
      case "connecting":
        return <span>🔄 Connecting...</span>;
      case "connected":
        return (
          <>
            <span className="hidden md:inline">{currentAccount}</span>
            <span className="inline md:hidden">{currentAccount?.slice(0, 6)}...{currentAccount?.slice(-4)}</span>
          </>
        );
      default:
        return <span>🔗 Connect Wallet</span>;
    }
  }, [connectStatus, currentAccount]);

  return comp;
}

export default function ConnectWallet() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { status: litProtocolStatus } = useLitProtocol();
  const {
    requireProvider,
    connectStatus,
    disconnect: disconnectWallet,
  } = useEthers();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Check if the clicked element is outside the wallet button or dropdown
      if (!target.closest("#connect-wallet")) {
        setIsDropdownOpen(false);
      }
    };
    window.addEventListener("click", handleClickOutside);
    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleTriggerClick = useCallback(async () => {
    if (connectStatus === "disconnected") {
      await requireProvider();
      return;
    } else if (connectStatus === "connected") {
      setIsDropdownOpen((prev) => !prev);
      return;
    }
  }, [connectStatus, requireProvider]);

  const handleDisconnect = useCallback(async () => {
    disconnectWallet();
    setIsDropdownOpen(false);
  }, [disconnectWallet]);

  return (
    <WalletButtonContainer id="connect-wallet">
      <WalletButton>
        <WalletButtonTrigger className="font-geist-mono" onClick={handleTriggerClick}>
          <ConnectWalletButton />
        </WalletButtonTrigger>
        <AnimatePresence>
          {isDropdownOpen && connectStatus === "connected" && (
            <DropdownContainer
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="flex flex-col gap-2 font-inter">
                <div className="flex gap-1">
                  <span>Lit Protocol:</span>
                  <span>{litProtocolStatus === "connected" ? "Connected" : "Not Connected"}</span>
                </div>
                <OrbButtonTiny $noGlow onClick={handleDisconnect}>
                  Disconnect Wallet
                </OrbButtonTiny>
              </div>
            </DropdownContainer>
          )}
        </AnimatePresence>
      </WalletButton>
    </WalletButtonContainer >
  );
};
