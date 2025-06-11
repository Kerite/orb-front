import styled, { css, keyframes } from "styled-components";

export const RecordsButton = styled.button`
  border-radius: 50px;
  background-color: rgba(255, 255, 255, 0.7);
  border-radius: 50px;
`;

export const OrbButton = styled.button<{ $noGlow?: boolean }>`
  padding: 1.125rem 2.25rem;
  font-size: 1rem;
  border-radius: 30px;
  background-color: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(10px);
  color: var(--text-color);
  cursor: pointer;
  transition: all 0.3s ease, transform 0.2s ease;
  user-select: none;
  ${(props) => !props.$noGlow && css`
    box-shadow: 0 0 12px var(--glow-color);
    border: 1.5px solid var(--accent-color);
  `}

  &:disabled {
    cursor: not-allowed;
  }

  &:hover:not([disabled]) {
    background-color: var(--accent-color);
    color: #0A0F1A;
    ${(props) => !props.$noGlow && css`
      box-shadow: 0 0 25px var(--glow-color);
    `}
    scale: 1.05;
  }

  @media (max-width: 768px) {
    padding: 10px 15px;
    font-size: 0.85rem;
  }
`;

export const OrbButtonMiddle = styled(OrbButton)`
  && {
    padding: 14px 25px;
    font-size: 0.95rem;
  }
`;

export const OrbButtonSmall = styled(OrbButton)`
  && {
    padding: 0.625rem 1.25rem;
    font-size: 0.95rem;
  }
`;

export const OrbButtonTiny = styled(OrbButton)`
  && {
    padding: 0.25rem 0.5rem;
    font-size: 0.85rem;
  }

  &:hover:not([disabled]) {
    scale: 1.01;
  }
`;

export const FloatTech = keyframes`
  0%, 100% { transform: translateY(0); filter: brightness(1); }
  50% { transform: translateY(-12px) scale(1.02); filter: brightness(1.2); }
`;

export const Title = styled.h1`
  font-family: var(--font-orbitron), sans-serif;
  font-size: 5rem;
  font-weight: 700;
  letter-spacing: 5px;
  color: var(--accent-color);
  text-shadow: 0 0 25px var(--glow-color), 0 0 60px var(--accent-color);
  animation: ${FloatTech} 5s ease-in-out infinite;
  text-align: center;
  margin-top: 6rem;
  user-select: none;

  @media (max-width: 768px) {
    font-size: 3rem;
  }
`;
