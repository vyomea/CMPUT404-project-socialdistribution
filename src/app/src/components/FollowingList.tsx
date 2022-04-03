import { List, ListItemButton, ListItemText } from "@mui/material";
import styled from "styled-components";
import Author from "../api/models/Author";

const ListContainer = styled.div`
  background-color: white;
  width: 50%;
  height: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
`;
const Block = styled.div`
  width: 100%;
  height: 100%;
  color: black;
  display: flex;
  flex-direction: column;
  overflow-y: scroll;
  text-align: left;
  align-items: center;
`;
const Header = styled.div`
  margin-top: 1%;
  font-size: 200%;
  text-align: center;
`;

const FollowingList = ({ data }: any) => {
  return (
    <ListContainer>
      <Block>
        <Header>Following</Header>
        <List>
          {data.map((follower: Author) => (
            <ListItemButton
              component="a"
              href={
                window.location.href.substring(
                  0,
                  window.location.href.search(data) - 1
                ) + follower.id
              }
            >
              <ListItemText primary={follower.displayName} />
            </ListItemButton>
          ))}
        </List>
      </Block>
    </ListContainer>
  );
};

export default FollowingList;
