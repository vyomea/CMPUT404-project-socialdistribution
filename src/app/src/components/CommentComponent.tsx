import { useState } from "react";
import { Avatar, Box } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import ReactMarkdown from "react-markdown";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import "katex/dist/katex.min.css"; // `rehype-katex` does not import the CSS for you
import Comment from "../api/models/Comment";
import api from "../api/api";

const ContentContainer = styled.div`
  padding: 1%;
  margin-top: 20px;
`;
const TopRowContainer = styled.div`
  display: flex;
  flex-direction: row;
`;
const NameContainer = styled.div`
  padding: 1%;
  text-decoration-line: underline;
  text-decoration-style: solid;
  font-weight: bold;
`;
const PostContainer = styled.div`
  width: 90%;
  height: auto;
  display: flex;
  margin-bottom: 10px;
`;

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
const cursorStyle = {
  cursor: "pointer",
};
const renderContent = (content: any, contentType: any) => {
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
  }
};

const CommentComponent = (props?: any): JSX.Element => {
  const comm: Comment = props?.comm;
  const numLikes = props?.likes;
  const [likes, setLikes] = useState(numLikes);
  const [liked, setLiked] = useState(likes === 0 ? true : false);
  const navigate = useNavigate();

  const HandleNavigation = (id: string) => {
    navigate(`/profile/${id.split("/").pop()}`);
  };

  const handleLikes = () => {
    if (likes !== undefined && likes >= 0) {
      setLiked(!liked);
      likes < 0 ? setLikes(0) : setLikes(likes);
      liked ? setLikes(likes + 1) : setLikes(likes - 1 > 0 ? likes - 1 : 0);
      api.authors
        .withId(comm.postAuthorId)
        .posts.withId(comm.postId)
        .comments.withId(comm.id)
        .likes.like();
    }
  };
  return (
    <>
      <PostContainer>
        <PostProfilePictureContainer>
          <Avatar
            onClick={() => HandleNavigation(comm.author.id)}
            style={cursorStyle}
            sx={{ width: 70, height: 70, m: 2 }}
          >
            {comm?.author?.profileImage ? (
              <Box
                component="img"
                src={comm?.author?.profileImage}
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
            <NameContainer
              onClick={() => HandleNavigation(comm.author.id)}
              style={cursorStyle}
            >
              {comm?.author?.displayName}
            </NameContainer>
          </TopRowContainer>
          <ContentContainer>
            {renderContent(comm?.comment, comm?.contentType)}
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
          </LikesCommentsContainer>
        </PostDetailsContainer>
      </PostContainer>
    </>
  );
};

export default CommentComponent;
