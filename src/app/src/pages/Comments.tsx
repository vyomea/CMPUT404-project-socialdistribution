import api from "../api/api";
import { v4 as uuidv4 } from "uuid";
import Author from "../api/models/Author";
import ReactMarkdown from "react-markdown";
import Post from "../api/models/Post";
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

  const createComment = () => {
    api.authors
      .withId(authorID)
      .posts.withId(postID)
      .comments.create(comment.comment, comment.contentType)
      .then((res) => console.log(res))
      .catch((err) => console.log("Hello " + err));
  };
  createComment();
  api.authors
    .withId(authorID)
    .posts.withId(postID)
    .comments.list()
    .then((res) => console.log("Res: " + res))
    .catch((err) => console.log("ERR: " + err));
  return <>{url}</>;
}
