import NavBar from '../components/NavBar';
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
import { Box, List, ButtonGroup, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import InboxComponents from '../components/InboxComponents';
import UserPost from '../components/UserPost';
import InboxItem from '../api/models/InboxItem';
import Comment from '../api/models/Comment';
import Like from '../api/models/Like';
import FollowRequest from '../api/models/FollowRequest';

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
  width: 25%;
`;

interface Props {
  currentUser?: Author;
}


export default function Mainpage({ currentUser }: Props) {
  const [open, setOpen] = useState(false);

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

  const [inbox, setInbox] = useState<InboxItem[] | undefined>(undefined);
  const [inboxChanged, setInboxChanged] = useState(false);
  const handleInboxChanged = () => {
    setInboxChanged(!inboxChanged);
  };

  useEffect(() => {
    api.authors
      .withId('' + currentUser?.id)
      .inbox
      .list()
      .then((data) => setInbox(data));
  }, [currentUser?.id, inboxChanged]);

  const [posts, setPosts] = useState<Post[] | undefined>(undefined);
  const [postsChanged, setPostsChanged] = useState(false);
  useEffect(() => {
    api.authors
      .withId('' + currentUser?.id)
      .posts
      .list()
      .then((data) => setPosts(data));
  }, [currentUser?.id, setPostsChanged]);

  const handlePostsChanged = () => {
    setPostsChanged(!postsChanged);
  };

  // Sidebar Button group
  const buttons = [
    {id:0,title:'Inbox'},
    {id:1,title:'Browse'}
  ];

  //FAKE DATA

  const a1: Author={
    type: "author",
    id: "http://localhost:3000/authors/b5b6c97c-3086-43a8-8bb3-2c3d351f000d",
    displayName: "Lara Croft",
    github: "",
    profileImage: "",
    isAdmin: false,
    verified: true,
  };
  const a2: Author={
    type: "author",
    id: "http://localhost:3000/authors/e28da252-9934-4e46-8fd5-3c3e46e5765e",
    displayName: "Nathan Drake",
    github: "",
    profileImage: "",
    isAdmin: false,
    verified: true,
  };

  const p1: Post={
    type: "post",
    id: "http://localhost:3000/authors/b5b6c97c-3086-43a8-8bb3-2c3d351f000d/posts/4cc45732-e915-46e3-8418-cacb0ae0b114",
    title: "Title",
    source: "https://www.uuidgenerator.net/version4",
    origin: "https://www.uuidgenerator.net/version4",
    description: "Hi",
    contentType:"text/plain",
    content: "Hi",
    image: "",
    categories: [],
    count: 10,
    published: new Date('December 17, 1995 03:24:00'),
    visibility: "PUBLIC",
    unlisted: false,
    author: a1,
  };
  const p2: Post={
    type: "post",
    id: "http://localhost:3000/authors/e28da252-9934-4e46-8fd5-3c3e46e5765e/posts/4cc45732-e915-46e3-8418-cacb0ae0b114",
    title: "Title",
    source: "https://www.uuidgenerator.net/version4",
    origin: "https://www.uuidgenerator.net/version4",
    description: "Bye",
    contentType:"text/plain",
    content: "Byew",
    image: "",
    categories: [],
    count: 10,
    published: new Date('December 17, 1995 03:24:00'),
    visibility: "PUBLIC",
    unlisted: false,
    author: a2,
  };


  const c1: Comment={
    type: "comment",
    id: "8138f8da-d948-489e-90c5-a8fb873b57cb",
    author: a1,
    comment: "Hey",
    contentType: "text/plain",
    published: `${new Date('December 17, 1995 03:24:00')}`,
    postUrl: "http://localhost:3000/authors/e28da252-9934-4e46-8fd5-3c3e46e5765e/posts/4cc45732-e915-46e3-8418-cacb0ae0b114", // URL of the API endpoint to get the post
    postServiceUrl: "http://localhost:3000/authors/e28da252-9934-4e46-8fd5-3c3e46e5765e/posts/4cc45732-e915-46e3-8418-cacb0ae0b114", // service URL of the post
    postId: "4cc45732-e915-46e3-8418-cacb0ae0b114", // id of the post the comment is on
  };
  const c2: Comment={
    type: "comment",
    id: "631febab-2044-43c3-9f0b-dbf5a1c868b2",
    author: a2,
    comment: "Bye",
    contentType: "text/plain",
    published: `${new Date('December 17, 1995 03:24:00')}`,
    postUrl: "http://localhost:3000/authors/e28da252-9934-4e46-8fd5-3c3e46e5765e/posts/4cc45732-e915-46e3-8418-cacb0ae0b114", // URL of the API endpoint to get the post
    postServiceUrl: "http://localhost:3000/authors/e28da252-9934-4e46-8fd5-3c3e46e5765e/posts/4cc45732-e915-46e3-8418-cacb0ae0b114", // service URL of the post
    postId: "4cc45732-e915-46e3-8418-cacb0ae0b114", // id of the post the comment is on
  };

  const l1: Like={
    type: "Like",
    summary: "Lara Croft likes your comment.",
    author: a1,
    object: "http://localhost:3000/authors/e28da252-9934-4e46-8fd5-3c3e46e5765e/posts/4cc45732-e915-46e3-8418-cacb0ae0b114/comments/631febab-2044-43c3-9f0b-dbf5a1c868b2",
  };
  const l2: Like={
    type: "Like",
    summary: "Nathan Drakes likes your post.",
    author: a1,
    object: "http://localhost:3000/authors/e28da252-9934-4e46-8fd5-3c3e46e5765e/posts/4cc45732-e915-46e3-8418-cacb0ae0b114",
  };

  const r1: FollowRequest={
    type: "Follow",
    summary: "Lara Croft wants to follow you.",
    actor: a1, //sends request
    object: a2 ,//recieves request
  };
  const r2: FollowRequest={
    type: "Follow",
    summary: "Nathan Drakes wants to follow you.",
    actor: a2, //sends request
    object: a1 ,//recieves request
  };

  const indexArray: InboxItem[] = [p1,l1,p2,p1,l2,c1,r1,p2,c2,l2,r2];

  //Set which list to display
  const [listDisplay, setListDisplay] = useState({id:0,title:'Inbox'});

  const lists = [
    indexArray?.map((item,index)=>
    (
    <InboxComponents 
      item={item} 
      currentUser={currentUser} 
      handlePostsChanged={handleInboxChanged} 
      key={index}
    />
    )),

    posts?.map((post)=>
    (
    <UserPost 
      post={post} 
      currentUser={currentUser} 
      postAuthor={post.author} 
      likes={0} 
      handlePostsChanged={handlePostsChanged} 
      key={post.id}
    />
    )),
  ]

  // Open Clear Dialog
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleClickOpen = () => {
    setDialogOpen(true);
  };

  const handleClickClose = () => {
    setDialogOpen(false);
  };

  const handleClear = () => {
      api.authors
      .withId('' + currentUser?.id)
      .inbox
      .clear()
      .then(()=>handleInboxChanged())
      .catch((e) => console.log(e.response))

      handleClickClose();
  };
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
          <Add currentUser={currentUser} handlePostsChanged={handleInboxChanged} handleClose={handleClose}/>
        </Backdrop>
      ) : (
        <MainPageContentContainer>
          <Box width='75%'>
            <List style={{ maxHeight: '100%', overflow: 'auto' }} sx={{ width: '100%', ml: 5 }}>
              <Box style={{
                width: '90%',
                display: 'flex',}}
              >
                <Box
                    sx={{
                    mb:5,
                    width:'90%',
                    ml: 13,
                    }}
                >
                    <ButtonGroup
                      orientation="horizontal"
                      aria-label="horizontal contained button group"
                      variant="contained"
                      size="large"
                      sx={{ 
                        width:'100%',
                      }}
                    >

                      {buttons.map((button) => (
                        <Button 
                          onClick={()=>setListDisplay(button)}
                          key={button.id} 
                          style={{
                            justifyContent: 'center'
                          }}
                          sx={{
                            justifyContent:"space-between", 
                            width: '90%',
                            
                          }}
                        > {button.title}
                        </Button>
                      ))}
                    </ButtonGroup>
                </Box>
              </Box>
              {lists[listDisplay.id]}
            </List>
            </Box>
          <GitContainer>
            <Github username={currentUser?.github ? `${currentUser.github.split('/').pop()}`:''} />
          </GitContainer>
          {listDisplay.title === "Inbox" ? (
            <Box style={{
              margin: 5,
              top: 'auto',
              right: 100,
              bottom: 20,
              left: 'auto',
              position: 'fixed',
            }}>
            <Button
              variant="contained"
              size="large"
              sx={{ 
                mt:5,
                backgroundColor: 'red'
              }}
              onClick={handleClickOpen}
              >Clear
            </Button>
            </Box>
          ):null}

        <Dialog
          open={dialogOpen}
          onClose={handleClickClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
      >
          <DialogTitle id="alert-dialog-title">
          {"Clear Inbox"}
          </DialogTitle>
          <DialogContent>
          <DialogContentText id="alert-dialog-description">
              Clear your inbox?
          </DialogContentText>
          </DialogContent>
          <DialogActions>
          <Button onClick={handleClickClose}>Cancel</Button>
          <Button onClick={handleClear} autoFocus>Ok</Button>
          </DialogActions>
      </Dialog>

        </MainPageContentContainer>
        
      )}
    </MainPageContainer>
  );
}
