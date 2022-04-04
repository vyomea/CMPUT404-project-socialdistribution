import React from "react";
import Button, { ButtonProps } from "@mui/material/Button";
import { styled as Styled } from "@mui/material/styles";
import styled from "styled-components";
import { NavigateFunction, useNavigate } from "react-router-dom";

export interface NavItem {
  text: string;
  handleClick: (navigate: NavigateFunction) => void;
}

interface NavBarProps {
  items: NavItem[];
}
const LogoContainer = styled.div`
  text-align: center;
  font-family: Avenir Next Light;
  font-size: 200%;
  margin-left: 10%;
  &::first-letter {
    color: white;
    text-shadow: 2px 2px 5px #ebb72a;
  }
  &:hover {
    cursor: pointer;
  }
`;
const NavContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  top: 0%;
  text-align: center;
  height: 80px;
  border-bottom: 1px;
  background-color: #f4e6d7;
`;
const Heading = styled.header`
  font-size: 50px;
  text-align: center;
  font-family: Avenir Next Light;
  margin-left: 14%;
`;
const NavItemsContainer = styled.div`
  padding: 10%;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
`;

const ColorButton = Styled(Button)<ButtonProps>(({ theme }) => ({
  color: theme.palette.getContrastText("#e6c9a8"),
  backgroundColor: "#f4e6d7",
  "&:hover": {
    backgroundColor: "#E8CEB0",
  },
}));

const NavBar: React.FC<NavBarProps> = (props) => {
  const url = new URL(window.location.href);
  let pathname = url?.pathname?.split("/")[1];
  pathname = pathname?.charAt(0)?.toUpperCase() + pathname?.slice(1);
  pathname = pathname === "" ? "Homepage" : pathname;
  const routes = ["Admin", "Profile", "Homepage"];
  pathname = routes.includes(pathname) ? pathname : "";
  const navigate = useNavigate();
  return (
    <NavContainer>
      <LogoContainer onClick={() => navigate("/")}>Website.</LogoContainer>
      <Heading>{pathname}</Heading>

      <NavItemsContainer>
        {props?.items?.map((item: NavItem) => (
          <ColorButton
            key={item?.text}
            variant="text"
            onClick={() => item?.handleClick(navigate)}
          >
            {item?.text}
          </ColorButton>
        ))}
      </NavItemsContainer>
    </NavContainer>
  );
};

export default NavBar;
