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

// This is for all the stuff in the Main Page
const MainPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: ${window.innerHeight}px;
  width: ${window.innerWidth}px;
`;

// This is for the posts and New Post Button and Github Activity
const MainPageContentContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  background-color: white;
`;

const GitContainer = styled.div`
  margin-right: 1%;
  width: 25%;
`;
interface Props {
  currentUser?: Author;
}

export default function Mainpage({ currentUser }: Props) {
  // For now, mainpage just shows your own posts
  const [open, setOpen] = useState(false);

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

  const [posts, setPosts] = useState<Post[] | undefined>(undefined);
  const [postsChanged, setpostsChanged] = useState(false);
  const handlePostsChanged = () => {
    setpostsChanged(!postsChanged);
  };

  useEffect(() => {
    api.authors
      .withId('' + currentUser?.id)
      .inbox
      .list()
      .then((data) => setInbox(data));
  }, [currentUser?.id, inboxChanged]);

  useEffect(() => {
    api.posts.list(1,10).then((data) => setPosts(data));
  }, [postsChanged]);
  
  //Set which list to display
  const [listDisplay, setListDisplay] = useState({
    id: 0,
    title: "Inbox",
  });
    
  // Sidebar Button group
  const buttons = [
    { id: 0, title: "Inbox" },
    { id: 1, title: "Browse" },
  ];
  
  const lists = [
    inbox?.map((item,index) => (
      <InboxComponents
        item={item}
        currentUser={currentUser}
        handlePostsChanged={handleInboxChanged}  
        key={index}
      />
    )),

    posts?.map((post) => (
      <UserPost
        post={post}
        currentUser={currentUser}
        postAuthor={post.author}
        likes={0}
        handlePostsChanged={handlePostsChanged}
        key={post.id}
      />
    )),
  ];

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
      <Fab
        color="primary"
        aria-label="check"
        style={{
          margin: 0,
          top: "auto",
          right: 20,
          bottom: 20,
          left: "auto",
          position: "fixed",
        }}
        sx={{ color: "black", background: "#f4e6d7", "&:hover": { background: "#E8CEB0" } }}
      >
        <AddIcon onClick={handleToggle} />
      </Fab>
      {open ? (
        <Backdrop
          sx={{
            color: "#fff",
            zIndex: (theme) => theme.zIndex.drawer + 1,
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
          open={open}
        >
          <CloseRounded
            onClick={handleClose}
            sx={{
              "&:hover": {
                cursor: "pointer",
              },
              marginBottom: "10px",
              borderRadius: "100%",
              border: "1px solid white",
            }}
          />
          <Add
            currentUser={currentUser}
            handlePostsChanged={handlePostsChanged}
            handleClose={handleClose}
          />
        </Backdrop>
      ) : (
        <MainPageContentContainer>
          <Box width="75%">
            <List style={{ maxHeight: "100%", overflow: "auto" }} sx={{ width: "100%", ml: 5 }}>
              <Box
                style={{
                  width: "90%",
                  display: "flex",
                }}
              >
                <Box
                  sx={{
                    mb: 5,
                    width: "90%",
                    ml: 13,
                  }}
                >
                  <ButtonGroup
                    orientation="horizontal"
                    aria-label="horizontal contained button group"
                    variant="contained"
                    size="large"
                    sx={{
                      width: "100%",
                    }}
                  >
                    {buttons.map((button) => (
                      <Button
                        onClick={() => setListDisplay(button)}
                        key={button.id}
                        style={{
                          justifyContent: "center",
                        }}
                        sx={{
                          justifyContent: "space-between",
                          width: "90%",
                        }}
                      >
                        {" "}
                        {button.title}
                      </Button>
                    ))}
                  </ButtonGroup>
                </Box>
              </Box>
              {lists[listDisplay.id]}
            </List>
          </Box>
          <GitContainer>
            <Github
              username={currentUser?.github ? `${currentUser.github.split("/").pop()}` : ""}
            />
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
