import Author, {
  authorFromResponse,
  AuthorRequest,
  AuthorResponse,
  authorToRequest,
} from "./Author";

export default interface Comment {
  type: "comment";
  id: string;
  author: Author;
  comment: string;
  contentType: string;
  published: string;
  postId: string;
}

export type CommentResponse = Omit<Comment, "id" | "author" | "postId"> & {
  id: string; // URL to the comment
  author: AuthorResponse;
};

export const commentFromResponse = (data: CommentResponse): Comment => {
  const match = /\/posts\/([^/]+)\/comments\/([^/]+)\/?$/.exec(data.id);
  if (match === null) {
    throw new Error(`Invalid comment URL ${data.id}`);
  }
  const postId = match[1];
  const commentId = match[2];

  return {
    ...data,
    author: authorFromResponse(data.author),
    id: commentId,
    postId: postId,
  };
};

export type CommentRequest = Omit<Comment, "id" | "author" | "postId"> & {
  id: string; // URL to the comment
  author: AuthorRequest;
};

export const commentToRequest = (
  comment: Comment,
  baseUrl: string
): CommentRequest => {
  return {
    ...comment,
    id: `${baseUrl}/authors/${comment.author.id}/posts/${comment.postId}/comments/${comment.id}`,
    author: authorToRequest(comment.author, baseUrl),
  };
};

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
