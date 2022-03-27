import Author, {
  authorFromResponse,
  AuthorRequest,
  AuthorResponse,
  authorToRequest,
} from "./Author";

export default interface Like {
  type: "Like";
  summary: string;
  author: Author;
  object: string; // URL to the liked post or comment
}

export type LikeResponse = Omit<Like, "author"> & {
  author: AuthorResponse;
};

export const likeFromResponse = (data: LikeResponse): Like => {
  return {
    type: "Like",
    summary: data.summary,
    author: authorFromResponse(data.author),
    object: data.object,
  };
};

export type LikeRequest = Omit<Like, "author"> & {
  author: AuthorRequest;
};

export const likeToRequest = (like: Like, baseUrl: string): LikeRequest => {
  return {
    ...like,
    author: authorToRequest(like.author, baseUrl),
  };
};
