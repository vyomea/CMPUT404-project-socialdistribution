import * as React from "react";
import {
  Card,
  CardContent,
  Button,
  ButtonGroup,
  Box,
  Typography,
  Avatar,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";

export default function ManageRequestsFollowing({
  user,
}: {
  user: { id: string; displayName: string; profileImage?: string | null };
}): JSX.Element {
  const buttons = [
    <Button onClick={() => alert("Unfollowed user!")} key="unfollow">
      {" "}
      Unfollow{" "}
    </Button>,
  ];

  return (
    <Card
      variant="outlined"
      sx={{
        m: 2,
        boxShadow: 2,
      }}
    >
      <CardContent
        sx={{
          width: '90%',
          height: 80,
        }}
      >
        <Box
          display="flex"
          sx={{
            width: "100%",
            height: "100%",
          }}
        >
          <Box
            display="flex"
            sx={{
              width: "50%",
              alignItems: "center",
            }}
          >
            {user.profileImage ? null : (
              <Avatar sx={{ width: 50, height: 50, mr: 2 }}>
                <PersonIcon sx={{ width: "100%", height: "100%" }} />
              </Avatar>
            )}

            <Box display="block">
              <Typography noWrap={true} sx={{ fontWeight: "bold" }}>
                {user.id}
              </Typography>

              <Typography>{user.displayName}</Typography>
            </Box>
          </Box>

          <Box
            display="flex"
            flexDirection="row-reverse"
            sx={{
              width: "50%",
              alignItems: "center",
            }}
          >
            <ButtonGroup variant="contained" size="large">
              {buttons}
            </ButtonGroup>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
