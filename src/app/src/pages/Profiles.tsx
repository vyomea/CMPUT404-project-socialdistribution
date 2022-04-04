import React, { useEffect, useState } from "react";
import {
  Avatar,
  Card,
  CardActionArea,
  CircularProgress,
  Container,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Typography,
} from "@mui/material";
import Author from "../api/models/Author";
import api from "../api/api";
import Node from "../api/models/Node";
import {
  createSearchParams,
  useSearchParams,
  useNavigate,
} from "react-router-dom";

interface Props {
  currentUser?: Author;
}

export default function Profiles({ currentUser }: Props): JSX.Element {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [nodes, setNodes] = useState<Record<string, Node | null> | undefined>(
    undefined
  );
  const [node, setNode] = useState<Node | null>(null);
  const [authors, setAuthors] = useState<Author[] | undefined>([]);

  // Get list of nodes
  useEffect(() => {
    api.nodes.list().then((nodesList) => {
      const nodesMap: Record<string, Node | null> = { "": null };
      for (const node of nodesList) {
        nodesMap[node.serviceUrl] = node;
      }
      setNodes(nodesMap);
    });
  }, []);

  // When the selected node in the Select component changes, set the node search param
  const handleSelectedNodeChange = (event: SelectChangeEvent) => {
    navigate({
      pathname: "/profile",
      search: createSearchParams({
        node: event.target.value,
      }).toString(),
    });
  };

  // When node search param changes, set the node
  useEffect(() => {
    setNode(nodes?.[searchParams.get("node") ?? ""] ?? null);
  }, [nodes, searchParams]);

  // When node changes, update the list of authors
  useEffect(() => {
    api.authors.list(1, 10, node?.serviceUrl).then(setAuthors);
  }, [node]);

  return (
    <Container>
      <Typography>Node</Typography>
      <Select
        disabled={!nodes}
        value={node?.serviceUrl || ""}
        label="Node"
        onChange={handleSelectedNodeChange}
      >
        <MenuItem value="">Local</MenuItem>
        {nodes &&
          Object.values(nodes).map(
            (node) =>
              node && (
                <MenuItem key={node.serviceUrl} value={node.serviceUrl}>
                  {node.incomingUsername} ({node.serviceUrl})
                </MenuItem>
              )
          )}
      </Select>
      {authors ? (
        authors.map((author) => (
          <Card key={author.id} sx={{ m: 2 }}>
            <CardActionArea
              sx={{ p: 2 }}
              onClick={() =>
                navigate({
                  pathname: `/profile/${author.id}`,
                  search: createSearchParams({
                    ...(node && { node: node.serviceUrl }),
                  }).toString(),
                })
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
