import Link from "next/link";
import styled from "styled-components";

const Sidebar = styled.div`
  position: fixed;
  display: flex;
  flex-direction: column;
  top: 50%;
  left: 20px;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(141, 224, 240, 0.3);
  border-radius: 20px;
  padding: 1rem;
  z-index: 2;
  box-shadow: 0 0 15px rgba(141, 224, 240, 0.2);
  user-select: none;

  @media (max-width: 1024px) {
    flex-direction: row;
    padding: 0.5rem;
    top: 10px;
    transform: none;
  }
`;

const NavLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text-color);
  margin: 1rem 0;
  text-decoration: none;
  font-size: 1rem;
  font-weight: 500;
  transition: 0.3s ease;
  padding: 8px 12px;
  border-radius: 12px;

  @media (max-width: 1024px) {
    margin: 0 0;
  }

  &:hover {
    background-color: rgba(141, 224, 240, 0.1);
    color: var(--accent-color);
    box-shadow: 0 0 8px var(--glow-color);
  }
`;

export default function SideBar() {
  return (
    <Sidebar>
      <NavLink href="/chat">
        <span >🧠</span>
        <span className="hidden sm:block">Build</span>
      </NavLink>
      <NavLink href="/memories">
        <span>📂</span>
        <span className="hidden sm:block">Explore</span>
      </NavLink>
    </Sidebar>
  );
}
