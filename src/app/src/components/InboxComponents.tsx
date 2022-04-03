import * as React from "react";
import Author from "../api/models/Author"
import Post from "../api/models/Post"
import Like from "../api/models/Like"
import Comment from "../api/models/Comment"
import FollowRequest from "../api/models/FollowRequest"
import MainLike from './MainLike';
import MainComment from './MainComment';
import MainRequest from './MainRequest';
import UserPost from './UserPost';

export default function AdminAuthorCard({
    item,
    currentUser,
    handlePostsChanged
}: {
    item: Post|Like|Comment|FollowRequest 
    currentUser: Author|undefined
    handlePostsChanged:any
}): JSX.Element {

    return (
    <>
        {item.type==="post" ? (
        <UserPost
            post={item}
            currentUser={currentUser}
            postAuthor={item.author}
            likes={0}
            handlePostsChanged={handlePostsChanged}
            key={item.id}
        />
        ):null}
        {item.type==="Like" ? (
            <MainLike like={item} key={item.author.id}/>
        ):null}
        {item.type==="Follow" ? (
            <MainRequest followRequest={item} key={item.object.id}/>
        ):null}
        {item.type==="comment" ? (
            <MainComment comment={item} key={item.id}/>
        ):null}

    </>
  );
};

