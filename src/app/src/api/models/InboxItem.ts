import Post, {
  postFromResponse,
  PostResponse,
  PostRequest,
  postToRequest,
} from "./Post";
import Like, {
  likeFromResponse,
  LikeRequest,
  LikeResponse,
  likeToRequest,
} from "./Like";
import Comment, {
  commentFromResponse,
  CommentResponse,
  CommentCreateRequest,
  commentCreateToRequest,
} from "./Comment";
import FollowRequest, { FollowRequestResponse } from "./FollowRequest";

type InboxItem = Post | FollowRequest | Like | Comment;
export default InboxItem;

export type InboxItemResponse =
  | PostResponse
  | FollowRequestResponse
  | LikeResponse
  | CommentResponse;

export const inboxItemFromResponse = (data: InboxItemResponse): InboxItem => {
  if (data.type === "post") {
    return postFromResponse(data);
  } else if (data.type === "Like") {
    return likeFromResponse(data);
  } else if (data.type === "comment") {
    return commentFromResponse(data);
  }
  throw new Error(`Unknown type ${(data as any)?.type}`);
};

export type InboxItemRequest = PostRequest | LikeRequest | CommentCreateRequest;

export const inboxItemToRequest = (
  inboxItem: InboxItem,
  baseUrl: string
): InboxItemRequest => {
  if (inboxItem.type === "post") {
    return postToRequest(inboxItem, baseUrl);
  } else if (inboxItem.type === "Like") {
    return likeToRequest(inboxItem, baseUrl);
  } else if (inboxItem.type === "comment") {
    return commentCreateToRequest(inboxItem, baseUrl);
  }
  throw new Error(`Unknown type ${(inboxItem as any)?.type}`);
};
