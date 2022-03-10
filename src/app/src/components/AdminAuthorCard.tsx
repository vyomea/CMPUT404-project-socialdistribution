import * as React from "react";
import { Card, CardContent, Button, ButtonGroup, Box, Typography, Avatar, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import Author from "../api/models/Author"
import api from "../api/api"

export default function AdminAuthorCard({
    author,
}: {
    author: Author
}): JSX.Element {

    //Open dialog for deleting an author
    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
      setOpen(true);
    };
  
    const handleClose = () => {
      setOpen(false);
    };

    const handleDelete = () => {
        alert('Deleted author')
        handleClose();
    };

    const buttons = [
        <Button onClick={()=>alert("Go to Edit User Page")}key="edit" > Edit </Button>,
        <Button onClick={handleClickOpen} key="del"> Delete </Button>,
    ];

    return (
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
                        {author.profileImage?(
                            null
                        ):
                        <Avatar sx={{ width: 50, height: 50, mr:2}}>
                            <PersonIcon
                                sx={{ width: '100%', height: '100%' }}
                            />
                        </Avatar>}
                        
                        <Box display="block">
                            <Typography noWrap={true} sx={{ fontWeight: 'bold' }}>
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
                            open={open}
                            onClose={handleClose}
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
                            <Button onClick={handleClose}>Cancel</Button>
                            <Button onClick={handleDelete} autoFocus>Ok</Button>
                            </DialogActions>
                        </Dialog>

                    </Box>
                </Box>
            </CardContent>
        </Card>
  );
};

