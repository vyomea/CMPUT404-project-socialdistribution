import Author, { authorFromResponse, AuthorResponse } from "./Author";

export default interface Comment {
  type: "comment";
  id: string;
  author: Author;
  comment: string;
  contentType: string;
  published: string;
  readonly postUrl: string; // URL of the API endpoint to get the post
  readonly postServiceUrl: string; // service URL of the post
  readonly postId: string; // id of the post the comment is on
}

export type CommentCreate = Pick<Comment, "comment" | "contentType">;

export type CommentResponse = Pick<
  Comment,
  "type" | "id" | "comment" | "contentType" | "published"
> & {
  id: string; // URL to the comment
  author: AuthorResponse;
};

export const commentFromResponse = (data: CommentResponse): Comment => {
  const match = /^((.*?)\/posts\/([^/]+))\/comments\/([^/]+)\/?$/.exec(data.id);
  if (match === null) {
    throw new Error(`Invalid comment URL ${data.id}`);
  }
  const [postUrl, postServiceUrl, postId, commentId] = match.slice(1);

  return {
    ...data,
    author: authorFromResponse(data.author),
    id: commentId,
    postServiceUrl,
    postId,
    postUrl,
  };
};

export type CommentCreateRequest = CommentCreate;

export const commentCreateToRequest = (
  comment: CommentCreate,
  baseUrl: string
): CommentCreateRequest => ({
  ...comment,
});

export type CommentsResponse = {
  type: "comments";
  page: number;
  size: number;
  post: string; // URL to the post
  id: string; // URL to the first page of comments
  comments: CommentResponse[];
};

export const commentsFromResponse = (data: CommentsResponse): Comment[] =>
  data.comments.map(commentFromResponse);
