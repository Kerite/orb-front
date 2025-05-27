import { isNormalCondition } from "@/utils/type-checker";
import { AccessControlConditions } from "@lit-protocol/types";
import { AvailableChains, LitChain } from "./constants";

export const getChainsFromCondition = (condition: AccessControlConditions) => {
  return Array.from(new Set(condition.map(c => isNormalCondition(c) ? c.chain : undefined).filter(c => c !== undefined)));
};

export const getSingleChainFromCondition = (condition: AccessControlConditions) => {
  const chains = getChainsFromCondition(condition);
  if (chains.length === 0) {
    throw new Error("No valid chains found in the condition");
  } else if (chains.length > 1) {
    throw new Error("Multiple chains found in the condition, please use a single chain");
  } else if (AvailableChains.includes(chains[0] as LitChain) === false) {
    throw new Error(`Unsupported chain: ${chains[0]}`);
  }
  return chains[0];
};
