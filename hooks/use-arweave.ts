"use client";
import { ArweaveContext } from "@/contexts/arweave/arweaveContext";
import { useContext } from "react";

export function useArweave() {
  return useContext(ArweaveContext);
}
