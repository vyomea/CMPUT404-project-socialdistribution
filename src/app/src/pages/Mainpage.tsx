import UserPost from "../components/UserPost";
import Github from "../components/Github";
import styled from "styled-components";
import Author from "../api/models/Author";
import Post from "../api/models/Post";
import api from "../api/api";
import Add from "../components/Add";
import { useState, useEffect } from "react";
import Backdrop from "@mui/material/Backdrop";
import { CloseRounded } from "@mui/icons-material";
import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";
import { List } from "@mui/material";

// This is for all the stuff in the Main Page
const MainPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: ${window.innerHeight}px;
  width: ${window.innerWidth}px;
`;

// This is for the posts and New Post Button and Github Activity
const MainPageContentContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  background-color: white;
`;

const GitContainer = styled.div`
  margin-right: 1%;
`;
interface Props {
  currentUser?: Author;
}

export default function Mainpage({ currentUser }: Props) {
  // For now, mainpage just shows your own posts
  const [posts, setPosts] = useState<Post[] | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const [postsChanged, setpostsChanged] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  const handleToggle = () => {
    setOpen(!open);
  };

  const handlePostsChanged = () => {
    setpostsChanged(!postsChanged);
  };

  useEffect(() => {
    api.authors
      .withId("" + currentUser?.id)
      .posts.list(1, 10)
      .then((data) => setPosts(data));
  }, [currentUser?.id, postsChanged]);

  return (
    <MainPageContainer>
      <Fab
        color="primary"
        aria-label="check"
        style={{
          margin: 0,
          top: "auto",
          right: 20,
          bottom: 20,
          left: "auto",
          position: "fixed",
        }}
        sx={{ color: "black", background: "#f4e6d7", "&:hover": { background: "#E8CEB0" } }}
      >
        <AddIcon onClick={handleToggle} />
      </Fab>
      {open ? (
        <Backdrop
          sx={{
            color: "#fff",
            zIndex: (theme) => theme.zIndex.drawer + 1,
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
          open={open}
        >
          <CloseRounded
            onClick={handleClose}
            sx={{
              "&:hover": {
                cursor: "pointer",
              },
              marginBottom: "10px",
              borderRadius: "100%",
              border: "1px solid white",
            }}
          />
          <Add
            currentUser={currentUser}
            handlePostsChanged={handlePostsChanged}
            handleClose={handleClose}
          />
        </Backdrop>
      ) : (
        <MainPageContentContainer>
          <List style={{ maxHeight: "100%", overflow: "auto" }} sx={{ width: "70%", ml: 5 }}>
            {posts?.map((post) => (
              <UserPost
                post={post}
                currentUser={currentUser}
                postAuthor={currentUser}
                likes={0}
                handlePostsChanged={handlePostsChanged}
                key={post.id}
              />
            ))}
          </List>
          <GitContainer>
            <Github
              username={currentUser?.github ? `${currentUser.github.split("/").pop()}` : ""}
            />
          </GitContainer>
        </MainPageContentContainer>
      )}
    </MainPageContainer>
  );
}
