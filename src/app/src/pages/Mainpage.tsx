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
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

  const items2 = [
    {
      Text: 'Home',
      handleClick: () => {
        navigate('/');
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
  const mockPost = {
    id: '5',
    title: 'title',
    source: 'www.google.com',
    origin: 'www.lol.com',
    description: 'description',
    contentType: 'text/markdown',
    content: '# Lmao',
    image: undefined,
    categories: 'JSON.stringify(category)',
    count: 5,
    published: new Date(),
    visibility: 'visibility',
    unlisted: 'unlisted',
  };
  useEffect(() => {
    api.authors
      .withId("" + currentUser?.id)
      .posts.list(1, 10)
      .then((data) => setPosts(data));
  }, [currentUser?.id, postsChanged]);

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
            <UserPost
              post={mockPost}
              currentUser={currentUser}
              postAuthor={currentUser}
              likes={0}
              handlePostsChanged={handlePostsChanged}
              key={mockPost.id}
            />
            {/* {posts?.map((post) => (
              <UserPost
                post={post}
                currentUser={currentUser}
                postAuthor={currentUser}
                likes={0}
                handlePostsChanged={handlePostsChanged}
                key={post.id}
              />
            ))} */}
          </List>
          <GitContainer>
            <Github username={currentUser?.displayName} />
          </GitContainer>
        </MainPageContentContainer>
      )}
    </MainPageContainer>
  );
}
