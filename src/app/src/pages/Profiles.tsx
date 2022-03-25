import React, { useEffect, useState } from "react";
import {
  Avatar,
  Card,
  CardActionArea,
  CircularProgress,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import Author from "../api/models/Author";
import api, { makeApi } from "../api/api";
import { useLocation, useNavigate } from "react-router-dom";

interface Props {
  currentUser?: Author;
}

export default function Profiles({ currentUser }: Props): JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();

  const node = new URLSearchParams(location.search).get("node");

  const [authors, setAuthors] = useState<Author[] | undefined>([]);

  useEffect(() => {
    const apiToUse = node ? makeApi(node) : api;
    apiToUse.authors.list().then(setAuthors);
  }, [node]);

  return (
    <Container>
      {authors ? (
        authors.map((author) => (
          <Card key={author.id} sx={{ m: 2 }}>
            <CardActionArea
              sx={{ p: 2 }}
              onClick={() =>
                navigate(
                  `/profile/${author.id}` +
                    (node ? "?" + new URLSearchParams({ node }).toString() : "")
                )
              }
            >
              <Stack direction="row">
                <Avatar src={author.profileImage} />
                <Typography>{author.displayName}</Typography>
              </Stack>
            </CardActionArea>
          </Card>
        ))
      ) : (
        <CircularProgress />
      )}
    </Container>
  );
}
