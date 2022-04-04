import * as React from "react";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  IconButton,
  Avatar,
  List,
  Button,
  Typography,
  Backdrop,
  ListItemButton,
} from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import PersonIcon from "@mui/icons-material/Person";
import { CloseRounded } from "@mui/icons-material";
import Author from "../api/models/Author";
import Post from "../api/models/Post";
import UserPost from "../components/UserPost";
import api from "../api/api";
import FollowerList from "../components/FollowerList";
import FollowingList from "../components/FollowingList";
import EditProfile from "../components/EditProfile";

interface Props {
  currentUser?: Author;
}

export default function Profile({ currentUser }: Props): JSX.Element {
  //Edit open
  const [open, setOpen] = React.useState(false);

  const handleClose = () => {
    setOpen(false);
  };
  const handleToggle = () => {
    setOpen(!open);
  };

  // Follower List
  const [followerOpen, setFollowerOpen] = React.useState(false);

  const handleFollowerToggle = () => {
    setFollowerOpen(!followerOpen);
  };

  const handleFollowerClose = () => {
    setFollowerOpen(false);
  };

  // Following List
  const [followingOpen, setFollowingOpen] = React.useState(false);

  const handleFollowingToggle = () => {
    setFollowingOpen(!followingOpen);
  };

  const handleFollowingClose = () => {
    setFollowingOpen(false);
  };

  //Get ID from params
  const { id } = useParams() as { id: string };

  //Get author from backend
  const [author, setAuthor] = useState<Author | undefined>(undefined);
  const [authorsChanged, setAuthorsChanged] = useState(false);

  const handleAuthorsChanged = () => {
    setAuthorsChanged(!authorsChanged);
  };

  useEffect(() => {
    api.authors
      .withId(id)
      .get()
      .then((data) => setAuthor(data))
      .catch((error) => {
        console.log("No author");
      });
  }, [id, authorsChanged]);

  //Get author's posts
  const [posts, setPosts] = useState<Post[] | undefined>(undefined);
  const [postsChanged, setpostsChanged] = useState(false);

  const handlePostsChanged = () => {
    setpostsChanged(!postsChanged);
  };

  useEffect(() => {
    api.authors
      .withId(id)
      .posts.list(1, 5)
      .then((data) => setPosts(data))
      .catch((error) => {
        console.log(error);
      });
  }, [id, postsChanged]);

  // If it's your profle - Edit
  let myProfile = false;
  if (currentUser && author && currentUser.id === author.id) {
    myProfile = true;
  }

  // If you follow them - Unfollow
  // You sent them a request - Request Sent
  // Else - Follow
  const [isFollowing, setFollowing] = useState(true);
  const [sentRequest, setRequestSent] = useState(false);

  const handleFollow = () => {
    setRequestSent(true);
  };

  const handleUnfollow = () => {
    setFollowing(false);
  };

  const [followersList, setFollowers] = useState<Author[]>([]);

  // get followers list
  useEffect(() => {
    async function fetchData() {
      try {
        const res = api.authors.withId("" + author?.id).followers.list();
        res.then((followers) => {
          setFollowers(followers);
        });
      } catch (err) {
        console.log(err);
      }
    }
    fetchData();
  }, [author?.id]);

  const [followingList, setFollowingList] = useState<Author[]>([]);

  // get following list
  useEffect(() => {
    async function fetchData() {
      try {
        const res = api.authors.withId("" + author?.id).followings.list();
        res.then((followings) => {
          setFollowingList(followings);
        });
      } catch (err) {
        console.log(err);
      }
    }
    fetchData();
  }, [author?.id]);

  if (author !== undefined && currentUser !== undefined) {
    return (
      <>
        {followerOpen ? (
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
            open={followerOpen}
          >
            <CloseRounded
              onClick={handleFollowerClose}
              sx={{
                "&:hover": {
                  cursor: "pointer",
                },
                marginBottom: "10px",
                borderRadius: "100%",
                border: "1px solid white",
              }}
            />
            <FollowerList
              data={followersList}
              handleAuthorsChanged={handleAuthorsChanged}
              handleClose={handleFollowerClose}
            />
          </Backdrop>
        ) : followingOpen ? (
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
            open={followingOpen}
          >
            <CloseRounded
              onClick={handleFollowingClose}
              sx={{
                "&:hover": {
                  cursor: "pointer",
                },
                marginBottom: "10px",
                borderRadius: "100%",
                border: "1px solid white",
              }}
            />
            <FollowingList
              data={followingList}
              handleAuthorsChanged={handleAuthorsChanged}
              handleClose={handleFollowingClose}
            />
          </Backdrop>
        ) : open ? (
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
            <EditProfile
              data={currentUser}
              handleAuthorsChanged={handleAuthorsChanged}
              handleClose={handleClose}
            />
          </Backdrop>
        ) : (
          <Box sx={{ height: window.innerHeight, width: window.innerWidth }}>
            <Box style={{ display: "flex", height: "95%" }} sx={{ bgcolor: "#fff" }}>
              <Box
                boxShadow={5}
                display="flex"
                sx={{
                  flexDirection: "column",
                  width: "30%",
                  justifyContent: "center",
                  alignItems: "center",
                  bgcolor: "#fff",
                }}
              >
                <Avatar sx={{ width: 150, height: 150 }}>
                  {author.profileImage ? (
                    <Box
                      component="img"
                      src={author.profileImage}
                      alt="profile image"
                      height="100%"
                      width="100%"
                      style={{
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <PersonIcon sx={{ width: "75%", height: "75%" }} />
                  )}
                </Avatar>

                <Typography variant="h4" align="center">
                  {author.displayName}
                </Typography>
                {author.github ? (
                  <IconButton onClick={() => window.open(`${author.github}`, "_blank")}>
                    <GitHubIcon />
                  </IconButton>
                ) : null}

                <Box
                  sx={{
                    marginBottom: 2,
                  }}
                >
                  <ListItemButton onClick={handleFollowerToggle}>
                    Followers: {followersList.length}
                  </ListItemButton>
                  <ListItemButton onClick={handleFollowingToggle}>
                    Following: {followingList.length}
                  </ListItemButton>
                </Box>

                {myProfile ? (
                  <Button variant="contained" onClick={handleToggle}>
                    Edit
                  </Button>
                ) : isFollowing ? (
                  <Button variant="contained" onClick={handleUnfollow}>
                    Unfollow
                  </Button>
                ) : sentRequest ? (
                  <Button variant="contained" disabled>
                    Request Sent
                  </Button>
                ) : (
                  <Button variant="contained" onClick={handleFollow}>
                    Follow
                  </Button>
                )}
              </Box>

              <Box
                overflow="auto"
                display="flex"
                sx={{
                  flexDirection: "column",
                  width: "70%",
                  alignItems: "center",
                  mt: 0.5,
                }}
              >
                <List style={{ maxHeight: "100%", overflow: "auto" }} sx={{ width: "100%" }}>
                  {posts?.map((post) => (
                    <UserPost
                      post={post}
                      currentUser={currentUser}
                      postAuthor={author}
                      likes={0}
                      handlePostsChanged={handlePostsChanged}
                      key={post.id}
                    />
                  ))}
                </List>
              </Box>
            </Box>
          </Box>
        )}
      </>
    );
  }
  return <Box />;
}
