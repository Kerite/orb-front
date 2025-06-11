import styled from "styled-components";

export const MemoryCardContainer = styled.div`
  display: flex;
  background-color: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--accent-color);
  border-radius: 20px;
  padding: 1.5rem;
  backdrop-filter: blur(4px);
  box-shadow: 0 0 10px var(--glow-color);
`;

export const MemorySummary = styled.div`
  font-size: 1rem;
  color: var(--text-color);
  opacity: 0.85;
`;

export const BalanceRequirement = styled.div`
  font-size: 0.9rem;
  color: var(--accent-color);
  margin-bottom: 0.5rem;
  text-align: right;
`;

export const TitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
`;
