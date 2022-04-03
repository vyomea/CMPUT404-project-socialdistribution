import { useState, useEffect } from "react";
import api from "../api/api";
import Author from "../api/models/Author";
import Comment from "../api/models/Comment";
import Post from "../api/models/Post";
import UserPost from "../components/UserPost";
import AddIcon from "@mui/icons-material/Add";
import CircularProgress from "@mui/material/CircularProgress";
import { List } from "@mui/material";
import CommentComponent from "../components/CommentComponent";
interface Props {
  currentUser?: Author;
}

export default function Comments({ currentUser }: Props): JSX.Element {
  const url = new URL(window.location.href).pathname;
  const postID = url.split("/")[4];
  const authorID = url.split("/")[2];

  const comment = {
    comment: "# THIS IS A COMMENT",
    contentType: "text/plain",
  };

  const [comments, setComments] = useState<Comment[]>([]);
  const [post, setPost] = useState<Post>();
  const [commentsChanged, setCommentsChanged] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const commentList = api.authors.withId(authorID).posts.withId(postID).comments.list();
        const post = api.authors.withId(authorID).posts.withId(postID).get();
        post.then((data) => setPost(data)).catch((err) => console.log(err));
        commentList.then((comment) => {
          setComments(comment);
          setCommentsChanged(false);
        });
      } catch (err) {
        console.log(err);
      }
    }
    fetchData();
  }, [authorID, postID, commentsChanged]);

  const createComment = () => {
    api.authors
      .withId(authorID)
      .posts.withId(postID)
      .comments.create(comment)
      .then((res) => setCommentsChanged(true))
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
        <AddIcon onClick={createComment} />
        {comments?.map((i) => {
          return <CommentComponent comm={i} likes={0} />;
        })}
      </List>
    </>
  );
}
