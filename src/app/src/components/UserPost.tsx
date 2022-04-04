import React from "react";
import Button from "@mui/material/Button";
import styled from "styled-components";
import { CloseRounded } from "@mui/icons-material";
import Backdrop from "@mui/material/Backdrop";
import Edit from "./Edit";
import Author from "../api/models/Author";
import Post from "../api/models/Post";
import { Avatar, Box } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import "katex/dist/katex.min.css"; // `rehype-katex` does not import the CSS for you

interface postItem {
  post: any | Post | undefined;
  currentUser?: Author | undefined;
  postAuthor?: Author | undefined;
  likes?: number;
  handlePostsChanged?: any;
}

// This is for the whole Post, which includes the profile picure, content, etc
const PostContainer = styled.div`
  width: 70%;
  height: auto;
  display: flex;
  margin-bottom: 10px;
  padding: 10px;
`;

// This is for the details of post: everything except the profile picture
const PostDetailsContainer = styled.div`
  height: 100%;
  width: 90%;
  display: flex;
  border-bottom: 1px solid grey;
  flex-direction: column;
  position: relative;
`;

// This is for the Profile Picture only
const PostProfilePictureContainer = styled.div`
  height: 100%;
`;

// This is for the Author name, edit button and delete button, which be at the top
const TopRowContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

// This is for the author name
const NameContainer = styled.div`
  padding: 1%;
  text-decoration-line: underline;
  text-decoration-style: solid;
  font-weight: bold;
`;
// This is for the Edit and Delete buttons
const EditDeleteButtonContainer = styled.div`
  padding: 1%;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  width: 100%;
`;

// This is for the post content, which can be text and images
const ContentContainer = styled.div`
  padding: 1%;
  margin-top: 20px;
  overflow-y: scroll;
`;

// This is for the likes and comments
const LikesCommentsContainer = styled.div`
  padding: 1%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  position: relative;
  bottom: 0;
  left: 0;
`;

// This is for the likes
const LikesContainer = styled.div`
  padding: 1%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  width: 90px;
`;

// This is for the comments
const CommentsContainer = styled.div`
  padding: 1%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  width: 130px;
  &:hover {
    cursor: pointer;
  }
`;

const cursorStyle = {
  cursor: "pointer",
};

const UserPost: React.FC<postItem> = (props?) => {
  const [open, setOpen] = React.useState(false);
  const [likes, setLikes] = React.useState(props?.likes);
  const [liked, setLiked] = React.useState(likes === 0 ? true : false);
  const navigate = useNavigate();

  const handleLikes = () => {
    if (likes !== undefined && likes >= 0 && props.postAuthor && props.post) {
      setLiked(!liked);
      likes < 0 ? setLikes(0) : setLikes(likes);
      liked ? setLikes(likes + 1) : setLikes(likes - 1 > 0 ? likes - 1 : 0);
      api.authors
        .withId(props.postAuthor.id)
        .posts.withId(props.post.id)
        .likes.like();
    }
  };
  let showButtons = false;
  const handleDelete = () => {
    if (props.currentUser) {
      api.authors
        .withId(props.currentUser?.id)
        .posts.withId("" + props?.post?.id)
        .delete()
        .then(() => props?.handlePostsChanged())
        .catch((e) => console.log(e.response));
    }
  };

  if (
    props?.postAuthor &&
    props?.currentUser &&
    props.currentUser.id === props.postAuthor.id
  ) {
    showButtons = true;
  }

  const renderContent = (content: any, contentType: any) => {
    // HACK
    let f = "/posts/" + props?.post?.id + "/image";
    let x = props?.currentUser?.id + f;
    let h = window.location.href + "authors/" + x;
    // Will work if running frontend on 3001
    // h = h.replace("3002", "3001");
    switch (contentType) {
      case "text/markdown":
        return (
          <ReactMarkdown
            children={content}
            //@ts-ignore
            remarkPlugins={[remarkMath]}
            //@ts-ignore
            rehypePlugins={[rehypeKatex]}
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || "");
                return !inline && match ? (
                  //@ts-ignore
                  <SyntaxHighlighter
                    children={String(children).replace(/\n$/, "")}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                  />
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              },
            }}
          />
        );

      case "text/plain":
        return content;
      case "image/png;base64":
      case "image/jpeg;base64":
        return (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignContent: "center",
            }}
          >
            <img
              style={{ width: "180px", height: "180px" }}
              src={h}
              alt="Unavailable"
            />
          </div>
        );
    }
  };

  const handleClose = () => {
    setOpen(false);
  };
  const handleToggle = () => {
    setOpen(!open);
  };

  //Navigate to user's profile from userpost
  const HandleNavigation = () => {
    navigate(`/profile/${props?.postAuthor?.id.split("/").pop()}`);
  };

  const navigateToComments = () => {
    navigate(
      `/profile/${props?.postAuthor?.id.split("/").pop()}/post/${
        props?.post?.id
      }`
    );
  };

  return (
    <>
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
          <Edit
            id={props?.post?.id}
            currentUser={props.currentUser}
            data={props?.post}
            handlePostsChanged={props?.handlePostsChanged}
            handleClose={handleClose}
          />
        </Backdrop>
      ) : (
        <PostContainer>
          <PostProfilePictureContainer>
            <Avatar
              onClick={HandleNavigation}
              style={cursorStyle}
              sx={{ width: 70, height: 70, m: 2 }}
            >
              {props?.postAuthor?.profileImage ? (
                <Box
                  component="img"
                  src={props.postAuthor.profileImage}
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
          </PostProfilePictureContainer>

          <PostDetailsContainer>
            <TopRowContainer>
              <NameContainer onClick={HandleNavigation} style={cursorStyle}>
                {props?.postAuthor?.displayName}
              </NameContainer>

              {showButtons ? (
                <EditDeleteButtonContainer>
                  <Button
                    variant="contained"
                    onClick={handleToggle}
                    sx={{
                      backgroundColor: "white",
                      color: "black",
                      "&:hover": { backgroundColor: "#f4e6d7" },
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleDelete}
                    sx={{
                      backgroundColor: "white",
                      color: "black",
                      "&:hover": { backgroundColor: "#f4e6d7" },
                    }}
                  >
                    Delete
                  </Button>
                </EditDeleteButtonContainer>
              ) : null}
            </TopRowContainer>
            <ContentContainer>
              {renderContent(props?.post?.content, props?.post?.contentType)}
            </ContentContainer>
            <LikesCommentsContainer>
              <LikesContainer onClick={handleLikes}>
                {likes}{" "}
                {liked ? (
                  <FavoriteBorderIcon
                    sx={{
                      "&:hover": {
                        cursor: "pointer",
                      },
                    }}
                  />
                ) : (
                  <FavoriteIcon
                    sx={{
                      color: "red",
                      "&:hover": {
                        cursor: "pointer",
                      },
                    }}
                  />
                )}
              </LikesContainer>
              <CommentsContainer onClick={navigateToComments}>
                {props?.post?.count} Comments
              </CommentsContainer>
            </LikesCommentsContainer>
          </PostDetailsContainer>
        </PostContainer>
      )}
    </>
  );
};

export default UserPost;
