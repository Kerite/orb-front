"use client";
import { addToast } from "@heroui/react";

export const downloadFile = (fileName: string, content: Blob) => {
  const url = window.URL.createObjectURL(content);

  const a = document.createElement('a');
  a.hidden = true;
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

export const handleError = (error: unknown, title: string) => {
  console.dir(error);
  const { reason } = error as { reason?: string }
  if (reason) {
    addToast({ title: `Failed to ${title}`, description: reason, color: "danger" });
  } else if (error instanceof Error) {
    addToast({ title: `Failed to ${title}`, description: error.message, color: "danger" });
  } else {
    addToast({ title: `Failed to ${title}`, description: String(error), color: "danger" });
  }
}

export const shouldAutoConnectWallet = (): boolean => {
  const walletConnected = localStorage.getItem("WALLET_CONNECTED");
  return !!walletConnected;
}
