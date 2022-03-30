import NavBar from '../components/NavBar';
import UserPost from '../components/UserPost';
import Github from '../components/Github';
import styled from 'styled-components';
import Author from '../api/models/Author';
import Post from '../api/models/Post';
import api from '../api/api';
import Add from '../components/Add';
import { useState, useEffect } from 'react';
import Backdrop from '@mui/material/Backdrop';
import { CloseRounded } from '@mui/icons-material';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import { List } from '@mui/material';
import Like from '../api/models/Like';
import MainLike from '../components/MainLike';
import Comment from '../api/models/Comment';
import MainComment from '../components/MainComment';

// This is for all the stuff in the Main Page
const MainPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: ${window.innerHeight}px;
  width: ${window.innerWidth}px;
`;

// This is for the NavBar
const NavBarContainer = styled.div`
  margin-bottom: 5%;
`;

// This is for the posts and New Post Button and Github Activity
const MainPageContentContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
`;

const GitContainer = styled.div`
  margin-right: 1%;
`;

interface Props {
  currentUser?: Author;
}

export default function Mainpage({ currentUser }: Props) {
  // For now, mainpage just shows your own posts
  const [posts, setPosts] = useState<Post[] | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const [postsChanged, setpostsChanged] = useState(false);

  const items2 = [
    {
      Text: 'Home',
      handleClick: () => {
        // navigate('/');
      },
    },
    {
      Text: 'Logout',
      handleClick: () => {
        api.logout();
        window?.location?.reload();
      },
    },
  ];

  const handleClose = () => {
    setOpen(false);
  };

  const handleToggle = () => {
    setOpen(!open);
  };

  const handlePostsChanged = () => {
    setpostsChanged(!postsChanged);
  };

  useEffect(() => {
    api.authors
      .withId('' + currentUser?.id)
      .posts.list(1, 10)
      .then((data) => setPosts(data));
  }, [currentUser?.id, postsChanged]);

  //Fake data to show likes/comments
  const likeAuthor: Author = {
    type: "author",
    id: 'http://127.0.0.1:5454/authors/9de17f29c12e8f97bcbbd34cc908f1baba40658e',
    displayName: 'Lara Croft',
    isAdmin: false,
  };

  const like: Like = {
    type: "Like",
    summary: 'Lara Croft liked your post',
    author: likeAuthor,
    object: 'http://127.0.0.1:5454/authors/9de17f29c12e8f97bcbbd34cc908f1baba40658e/posts/de305d54-75b4-431b-adb2-eb6b9e546013'
  }

  const comment: Comment = {
    type: "comment",
    id: 'http://127.0.0.1:5454/authors/9de17f29c12e8f97bcbbd34cc908f1baba40658e/posts/de305d54-75b4-431b-adb2-eb6b9e546013/comments/f6255bb01c648fe967714d52a89e8e9c',
    author: likeAuthor,
    comment: 'Wow!',
    contentType: 'text/plain',
    published: '2015-03-09T13:07:04+00:00',
    postId: 'http://127.0.0.1:5454/authors/9de17f29c12e8f97bcbbd34cc908f1baba40658e/posts/de305d54-75b4-431b-adb2-eb6b9e546013'
  }

  return (
    <MainPageContainer>
      <NavBarContainer>
        <NavBar items={items2} />
      </NavBarContainer>
      <Fab
        color="primary"
        aria-label="check"
        style={{
          margin: 0,
          top: 'auto',
          right: 20,
          bottom: 20,
          left: 'auto',
          position: 'fixed',
        }}
        sx={{ color: 'black', background: '#46ECA6', '&:hover': { background: '#18E78F' } }}
      >
        <AddIcon onClick={handleToggle} />
      </Fab>
      {open ? (
        <Backdrop
          sx={{
            color: '#fff',
            zIndex: (theme) => theme.zIndex.drawer + 1,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
          open={open}
        >
          <CloseRounded
            onClick={handleClose}
            sx={{
              '&:hover': {
                cursor: 'pointer',
              },
              marginBottom: '10px',
              borderRadius: '100%',
              border: '1px solid white',
            }}
          />
          <Add currentUser={currentUser} handlePostsChanged={handlePostsChanged} />
        </Backdrop>
      ) : (
        <MainPageContentContainer>
          <List style={{ maxHeight: '100%', overflow: 'auto' }} sx={{ width: '70%', ml: 5 }}>
            {posts?.map((post) => (
              <UserPost
                post={post}
                currentUser={currentUser}
                postAuthor={currentUser}
                likes={0}
                handlePostsChanged={handlePostsChanged}
                key={post.id}
              />
            ))}
              <MainLike 
                key={like.author.id}
                like={like}
              />

              <MainComment 
                key={comment.author.id}
                comment={comment}
              />
          </List>
          <GitContainer>
            <Github username={currentUser?.github ? `${currentUser.github.split('/').pop()}`:''} />
          </GitContainer>
        </MainPageContentContainer>
      )}
    </MainPageContainer>
  );
}
