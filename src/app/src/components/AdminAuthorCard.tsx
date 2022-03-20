import * as React from "react";
import { Card, CardContent, Button, ButtonGroup, Box, Typography, Avatar, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Backdrop} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import { CloseRounded } from '@mui/icons-material';
import Author from "../api/models/Author"
import EditAuthor from './EditAuthor';
import api from '../api/api';
import { useNavigate } from "react-router-dom";

export default function AdminAuthorCard({
    author,
    handleAuthorsChanged,
}: {
    author: Author,
    handleAuthorsChanged: any
}): JSX.Element {

    //Navigate to profile
    const navigate = useNavigate();

    //Open dialog for deleting an author
    const [deleteOpen, setDeleteOpen] = React.useState(false);

    const handleClickOpen = () => {
        setDeleteOpen(true);
    };
  
    const handleClickClose = () => {
        setDeleteOpen(false);
    };

    const handleDelete = () => {
        api.authors
        .withId(author.id)
        .delete()
        .then(()=>{handleAuthorsChanged()})
        .catch((e) => console.log(e.response))

        handleClickClose();
    };

    //Edit open
    const [open, setOpen] = React.useState(false);

    const handleClose = () => {
        setOpen(false);
      };
      const handleToggle = () => {
        setOpen(!open);
      };

    const buttons = [
        <Button onClick={handleToggle}key="edit" > Edit </Button>,
        <Button onClick={handleClickOpen} key="del"> Delete </Button>,
    ];

    return (
    <>
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
          <EditAuthor
            data={author}
            handleAuthorsChanged={handleAuthorsChanged} 
            handleClose={handleClose}
          />
        </Backdrop>
      ) : (
        <Card 
            variant="outlined" 
            sx={{
            m:2,
            boxShadow:2,
            }}
        >
            <CardContent sx={{
                width: '90%',
                height:80,
            }}>
                <Box display="flex" sx={{
                        width: '100%',
                        height:'100%',
                }}>
                    <Box display="flex" sx={{
                        width: '50%',
                        alignItems: 'center',
                    }}>
                        
                        <Avatar sx={{ width: 50, height: 50, mr:2 }} >
                        {author.profileImage ? 
                            <Box
                                component="img"
                                src={author.profileImage}
                                alt="profile image"
                                height="100%"
                                width="100%"
                                style={{
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                }}
                            />
                            : (
                            <PersonIcon sx={{ width: '75%', height: '75%' }} />
                            )}
                        </Avatar> 
                        
                        <Box display="block">
                            <Typography 
                            onClick={()=>navigate(`/profile/${author.id}`)} 
                            noWrap={true} 
                            style={{cursor:'pointer'}} 
                            sx={{ fontWeight: 'bold', textDecoration:'underline' }}
                            >
                                {author.id}
                            </Typography>

                            <Typography>
                                {author.displayName}
                            </Typography>
                        </Box>

                    </Box>

                    <Box display="flex" flexDirection="row-reverse"sx={{
                        width: '50%',
                        alignItems: 'center',
                    }}>
                        <ButtonGroup variant="contained" size="large">
                            {buttons}
                        </ButtonGroup>

                        <Dialog
                            open={deleteOpen}
                            onClose={handleClickClose}
                            aria-labelledby="alert-dialog-title"
                            aria-describedby="alert-dialog-description"
                        >
                            <DialogTitle id="alert-dialog-title">
                            {"Delete Author"}
                            </DialogTitle>
                            <DialogContent>
                            <DialogContentText id="alert-dialog-description">
                                Delete author from server?
                            </DialogContentText>
                            </DialogContent>
                            <DialogActions>
                            <Button onClick={handleClickClose}>Cancel</Button>
                            <Button onClick={handleDelete} autoFocus>Ok</Button>
                            </DialogActions>
                        </Dialog>

                    </Box>
                </Box>
            </CardContent>
        </Card>)}
    </>
  );
};

