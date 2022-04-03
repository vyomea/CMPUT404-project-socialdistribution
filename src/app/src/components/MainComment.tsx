import * as React from "react";
import { Box, Card, CardContent, Typography } from "@mui/material";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import { useNavigate } from "react-router-dom";
import Comment from "../api/models/Comment";

export default function MainComment({
  comment,
}: {
  comment: Comment;
}): JSX.Element {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/post/${comment.postId}?node=${comment.postServiceUrl}`);
  };

  return (
    <Box
      style={{
        width: "90%",
        display: "flex",
      }}
    >
      <Card
        variant="outlined"
        sx={{
          my: 1,
          boxShadow: 2,
          width: "90%",
          ml: 13,
        }}
      >
        <CardContent
          sx={{
            height: 15,
            width: "90%",
          }}
        >
          <Box
            style={{
              display: "flex",
              alignItems: "center",
            }}
            sx={{
              width: "100%",
              height: "100%",
            }}
          >
            <ChatBubbleOutlineIcon />
            <Typography noWrap ml={0.5}>
              {comment.author.displayName} commented on your post:{" "}
              <Box
                style={{ textDecoration: "underline", cursor: "pointer" }}
                component="span"
                onClick={handleClick}
              >
                {comment.comment}
              </Box>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

