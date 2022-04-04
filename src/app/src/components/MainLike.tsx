import * as React from "react";
import { Box, Card, CardContent, Typography } from "@mui/material";
import Like from "../api/models/Like"
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useNavigate } from "react-router-dom";

export default function MainLike({
    like,
}: {
    like: Like,
}): JSX.Element {
    const navigate = useNavigate();

    const idArray = like.object.split('/');
    const authorId = idArray[4];
    const postId = idArray[6];

    const handleClick = () =>{
        navigate(`/profile/${authorId}/post/${postId}`);
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
                    <FavoriteIcon/>
                    <Typography noWrap ml={0.5}>
                        <Box style={{textDecoration: 'underline', cursor:'pointer'}} component="span" onClick={handleClick}> {like.summary}</Box>
                    </Typography>
                    </Box>

            </CardContent>
        </Card>
    </Box>
  );
};

