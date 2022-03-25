import Author, {
  authorFromResponse,
  AuthorRequest,
  AuthorResponse,
  authorToRequest,
} from "./Author";
import { CommentResponse } from "./Comment";

export default interface Post {
  type: "post";
  id: string;
  title: string;
  source: string;
  origin: string;
  description: string;
  contentType:
    | "text/markdown"
    | "text/plain"
    | "application/base64"
    | "image/png;base64"
    | "image/jpeg;base64";
  content: string;
  image: string;
  categories: string[];
  count: number;
  published: Date;
  visibility: "PUBLIC" | "FRIENDS";
  unlisted: boolean;
  author: Author;
}

export type PostResponse = Omit<Post, "id" | "author"> & {
  id: string; // URL to the post
  author: AuthorResponse;
  comments: string; // URL to the first page of comments
  commentsSrc?: { comments: CommentResponse[] };
};

export const postFromResponse = (data: PostResponse): Post => {
  const match = /\/posts?\/([^/]+)\/?$/.exec(data.id);
  if (match === null) {
    throw new Error(`Invalid post URL ${data.id}`);
  }
  return {
    ...data,
    id: match[1],
    author: authorFromResponse(data.author),
  };
};

export type PostRequest = Omit<Post, "id" | "author"> & {
  id: string; // URL to the post
  author: AuthorRequest;
};

export const postToRequest = (post: Post, baseUrl: string): PostRequest => {
  return {
    ...post,
    id: `${baseUrl}/authors/${post.author.id}/posts/${post.id}`,
    author: authorToRequest(post.author, baseUrl),
  };
};
