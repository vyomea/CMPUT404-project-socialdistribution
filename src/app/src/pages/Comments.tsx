import { useState, useEffect } from "react";
import api from "../api/api";
import Author from "../api/models/Author";
import Comment from "../api/models/Comment";
import UserPost from "../components/UserPost";

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
  useEffect(() => {
    async function fetchData() {
      try {
        const commentList = api.authors.withId(authorID).posts.withId(postID).comments.list();
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
  createComment();
  return (
    <>
      {comments?.map((comment) => {
        return <>{comment.comment}</>;
      })}
    </>
  );
}
