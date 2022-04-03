import * as React from "react";
import { Box, Card, CardContent, Typography } from "@mui/material";
import Like from "../api/models/Like"
import FavoriteIcon from '@mui/icons-material/Favorite';

export default function MainLike({
    like,
}: {
    like: Like,
}): JSX.Element {
    const handleClick = () =>{
        window.open(`${like.object}`,"_blank");
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
                            {like.summary}: <Box style={{textDecoration: 'underline', cursor:'pointer'}} component="span" onClick={handleClick}>{like.object}</Box>
                        </Typography>
                    </Box>

            </CardContent>
        </Card>
    </Box>
  );
};

