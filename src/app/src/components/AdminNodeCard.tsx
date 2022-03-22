import * as React from "react"
import { Card, CardContent, Button, Box, Typography, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from "@mui/material"
import Node from "../api/models/Node";
import api from "../api/api";

export default function AdminNodeCard({
    node,
    handleNodesChanged
}: {
    node: Node,
    handleNodesChanged: any
}): JSX.Element {

    //Open dialog for deleting a node
    const [deleteOpen, setDeleteOpen] = React.useState(false);

    const handleClickOpen = () => {
        setDeleteOpen(true);
    };
  
    const handleClickClose = () => {
        setDeleteOpen(false);
    };

    //Handle deleting of node
    const handleDelete = () => {
        api.nodes
        .withId(node.id)
        .delete()
        .then(()=>{handleNodesChanged()})
        .catch((e) => console.log(e.response))

        handleClickClose();
    };

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
                        <Box display="block">
                            <Typography sx={{ fontWeight: 'bold' }}>
                                {node.id}
                            </Typography>

                            <Typography>
                            {node.username}
                            </Typography>
                        </Box>

                    </Box>

                    <Box display="flex" flexDirection="row-reverse"sx={{
                        width: '50%',
                        alignItems: 'center',
                    }}>
                        <Button variant="contained" size="large" onClick={handleClickOpen}>
                            Delete
                        </Button>

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
                                Delete {node.username} from server?
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
        </Card>
  );
};

