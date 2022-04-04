import * as React from "react";
import { Box, Button, Card, CardContent } from "@mui/material";
import FollowRequest from "../api/models/FollowRequest"
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

export default function MainRequest({
    followRequest,
}: {
    followRequest: FollowRequest,
}): JSX.Element {
    const handleClick = () =>{
        const authorId = `${followRequest.actor.id.split('/').pop()}`;
        //Opens profile in new tab
        window.open(`profile/${authorId}`,"_blank");
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
                        <Button variant="contained" size="small" onClick={()=>alert("Accepted follow")}key="accept" > Accept </Button>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    </Box>
  );
};

