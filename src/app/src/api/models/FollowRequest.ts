import Author from "./Author";
export default interface FollowRequest {
  type: "Follow";
  summary: string;
  actor: Author; //sends request
  object: Author; //recieves request
}

export type FollowRequestResponse = FollowRequest;

export type FollowRequestRequest = FollowRequest;
