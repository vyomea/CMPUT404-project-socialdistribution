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
import FollowRequest, { FollowRequestResponse } from "./FollowRequest";

type InboxItem = Post | FollowRequest | Like;
export default InboxItem;

export type InboxItemResponse =
  | PostResponse
  | FollowRequestResponse
  | LikeResponse;

export const inboxItemFromResponse = (data: InboxItemResponse): InboxItem => {
  if (data.type === "post") {
    return postFromResponse(data);
  } else if (data.type === "Like") {
    return likeFromResponse(data);
  }
  throw new Error(`Unknown type ${(data as any)?.type}`);
};

export type InboxItemRequest = PostRequest | LikeRequest;

export const inboxItemToRequest = (
  inboxItem: InboxItem,
  baseUrl: string
): InboxItemRequest => {
  if (inboxItem.type === "post") {
    return postToRequest(inboxItem, baseUrl);
  } else if (inboxItem.type === "Like") {
    return likeToRequest(inboxItem, baseUrl);
  }
  throw new Error(`Unknown type ${(inboxItem as any)?.type}`);
};
