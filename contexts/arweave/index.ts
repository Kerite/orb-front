import { useContext } from "react";
import { ArweaveContext } from "./arweaveContext";
import { ArweaveProvider } from "./arweaveProvider";

const useArweave = () => {
  const context = useContext(ArweaveContext);
  if (!context) {
    throw new Error("useArweave must be used within an ArweaveProvider");
  }
  return context;
}

export {
  ArweaveProvider,
  useArweave
};

