import * as React from "react";
import { Box, Button, Card, CardContent } from "@mui/material";
import FollowRequest from "../api/models/FollowRequest"
import Author from "../api/models/Author"
import api from "../api/api"
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

export default function MainRequest({
    followRequest,
    currentUser,
}: {
    followRequest: FollowRequest,
    currentUser: Author|undefined,

}): JSX.Element {
    const authorId = `${followRequest.actor.id.split('/').pop()}`;

     //Opens profile in new tab
    const handleClick = () =>{
        window.open(`profile/${authorId}`,"_blank");
    }

    // let user follow me
    const handleFollow = () =>{
        api.authors
        .withId(`${currentUser?.id}`)
        .followers
        .withId(authorId)
        .follow()
        .catch((e) => {
            console.log(e.response);
        });
    }

    return (
    <Box style={{
        width: '90%',
        display: 'flex',}}
    >
        <Card 
            variant="outlined"
            sx={{
            my:1,
            boxShadow:2,
            width:'90%',
            ml: 13,
            }}
        >
            <CardContent sx={{
                height:15,
                width: '90%',
            }}>
                <Box style={{
                        display: 'flex',
                        alignItems: 'center'}}
                    sx={{
                        width: '100%',
                        height:'100%',
                    }}>
                    <AccountCircleIcon/>
                    <Box style={{
                            textDecoration: 'underline', 
                            cursor:'pointer'
                        }}  
                        sx={{
                            width: '50%',
                            ml: 0.5,
                        }} 
                        component="span" 
                        onClick={handleClick}>
                        {followRequest.summary}
                    </Box>
                    
                    <Box display="flex" flexDirection="row-reverse"sx={{
                        width: '50%',
                        alignItems: 'center',
                    }}>
                        <Button variant="contained" size="small" onClick={handleFollow} key="accept" > Accept </Button>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    </Box>
  );
};

