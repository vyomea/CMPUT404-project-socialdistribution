import * as React from "react";
import InboxItem from "../api/models/InboxItem"
import Author from "../api/models/Author"
import MainLike from './MainLike';
import MainComment from './MainComment';
import MainRequest from './MainRequest';
import UserPost from './UserPost';

export default function AdminAuthorCard({
    item,
    currentUser,
    handlePostsChanged
}: {
    item: InboxItem
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
            <MainRequest followRequest={item} currentUser={currentUser} key={item.object.id}/>
        ):null}
        {item.type==="comment" ? (
            <MainComment comment={item} key={item.id}/>
        ):null}

    </>
  );
};

