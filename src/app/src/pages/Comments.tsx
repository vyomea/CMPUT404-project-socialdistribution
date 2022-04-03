import { useState, useEffect } from "react";
import api from "../api/api";
import Author from "../api/models/Author";
import Comment from "../api/models/Comment";
import Post from "../api/models/Post";
import UserPost from "../components/UserPost";
import AddIcon from "@mui/icons-material/Add";
import { Avatar, Box } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import CircularProgress from "@mui/material/CircularProgress";
import ReactMarkdown from "react-markdown";
import { List } from "@mui/material";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import CommentComponent from "../components/CommentComponent";
interface Props {
  currentUser?: Author;
}

export default function Comments({ currentUser }: Props): JSX.Element {
  const url = new URL(window.location.href).pathname;
  const postID = url.split("/")[4];
  const authorID = url.split("/")[2];

  const comment = {
    comment: "# comment",
    contentType: "text/markdown",
  };

  const [comments, setComments] = useState<Comment[]>([]);
  const [post, setPost] = useState<Post>();

  useEffect(() => {
    async function fetchData() {
      try {
        const commentList = api.authors.withId(authorID).posts.withId(postID).comments.list();
        const post = api.authors.withId(authorID).posts.withId(postID).get();
        post.then((data) => setPost(data)).catch((err) => console.log(err));
        commentList.then((comment) => {
          setComments(comment);
        });
      } catch (err) {
        console.log(err);
      }
    }
    fetchData();
  }, [authorID, postID]);

  const createComment = () => {
    api.authors
      .withId(authorID)
      .posts.withId(postID)
      .comments.create(comment)
      .then((res) => console.log(res))
      .catch((err) => console.log("Hello " + err));
  };
  // createComment();

  return (
    <>
      {post ? (
        <UserPost post={post} likes={5} currentUser={currentUser} postAuthor={currentUser} />
      ) : (
        <CircularProgress color="success" />
      )}
      <List style={{ maxHeight: "100%", overflow: "auto" }} sx={{ width: "70%", ml: 5 }}>
        {comments?.map((i) => {
          return <CommentComponent comm={i} likes={0} />;
        })}
      </List>
    </>
  );
}
