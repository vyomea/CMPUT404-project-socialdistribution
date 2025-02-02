import * as React from "react";
import {
  Box,
  List,
  ButtonGroup,
  Button,
  Badge,
  Typography,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import AdminAuthorCard from "../components/AdminAuthorCard";
import AdminPostCard from "../components/AdminPostCard";
import AdminNodeCard from "../components/AdminNodeCard";
import Author from "../api/models/Author";
import Post from "../api/models/Post";
import Node from "../api/models/Node";
import api from "../api/api";
import { useState, useEffect } from "react";
import Backdrop from "@mui/material/Backdrop";
import { CloseRounded } from "@mui/icons-material";
import AddNode from "../components/AddNode";
import AddAuthor from "../components/AddAuthor";

export default function Admin(): JSX.Element {
  //Toggles for adding new authors and/or nodes
  const [open, setOpen] = useState(false);
  const [nodesChanged, setNodesChanged] = useState(false);
  const [authorsChanged, setAuthorsChanged] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  const handleToggle = () => {
    setOpen(!open);
  };

  //Get list of authors from backend
  const [authors, setAuthors] = useState<Author[] | undefined>(undefined);

  const handleAuthorsChanged = () => {
    setAuthorsChanged(!authorsChanged);
  };

  useEffect(() => {
    api.authors
      .list(1, 10)
      .then((data) => setAuthors(data))
      .catch((e) => console.log(e.response));
  }, [authorsChanged]);

  //Get all posts of first author
  const [posts, setPosts] = useState<Post[] | undefined>(undefined);
  const [authorID, setAuthorID] = React.useState(authors ? authors[0].id : "");

  const handleChange = (event: SelectChangeEvent) => {
    setAuthorID(event.target.value as string);
  };

  //Temporary posts for now
  //Want to get all posts if no filter is applied
  //Filter should be a list of authors to click,
  //when selected show all posts from authors who are friends with the selected author
  useEffect(() => {
    api.authors
      .withId(authorID)
      .posts.list(1, 10)
      .then((data) => setPosts(data))
      .catch((e) => console.log(e.response));
  }, [authorID]);

  //Get list of all nodes from backend
  //If node created or deleted, fetch from backend again
  const [nodes, setNodes] = useState<Node[] | undefined>(undefined);

  const handleNodesChanged = () => {
    setNodesChanged(!nodesChanged);
  };

  useEffect(() => {
    api.nodes
      .list()
      .then((data) => setNodes(data))
      .catch((e) => console.log(e.response));
  }, [nodesChanged]);

  // Get length of lists for badges
  const totalAuthors = authors ? authors.length : 0;
  const totalPosts = posts ? posts.length : 0;
  const totalNodes = nodes ? nodes.length : 0;

  //Set which list to display
  const [listDisplay, setListDisplay] = React.useState({
    id: 0,
    title: "Authors",
    count: totalAuthors,
  });

  //Button styling
  const buttonStyle = {
    justifyContent: "space-between",
    display: "flex",
  };

  const badgeStyle = {
    justifyContent: "right",
    mx: 3,
  };

  // Sidebar Button group
  const buttons = [
    { id: 0, title: "Authors", count: totalAuthors },
    { id: 1, title: "Posts", count: totalPosts },
    { id: 2, title: "Nodes", count: totalNodes },
  ];

  // Lists to display per button
  const lists = [
    authors?.map((author) => (
      <AdminAuthorCard
        author={author}
        handleAuthorsChanged={handleAuthorsChanged}
        key={author.id}
      />
    )),
    posts?.map((post) => <AdminPostCard post={post} key={post.id} />),
    nodes?.map((node) => (
      <AdminNodeCard
        node={node}
        handleNodesChanged={handleNodesChanged}
        key={node.serviceUrl}
      />
    )),
  ];

  return (
    <>
      {open ? (
        <Backdrop
          sx={{
            color: "#fff",
            zIndex: (theme) => theme.zIndex.drawer + 1,
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
          open={open}
        >
          <CloseRounded
            onClick={handleClose}
            sx={{
              "&:hover": {
                cursor: "pointer",
              },
              marginBottom: "10px",
              borderRadius: "100%",
              border: "1px solid white",
            }}
          />
          {listDisplay.title === "Nodes" ? (
            <AddNode
              handleNodesChanged={handleNodesChanged}
              handleClose={handleClose}
            />
          ) : null}

          {listDisplay.title === "Authors" ? (
            <AddAuthor
              handleAuthorsChanged={handleAuthorsChanged}
              handleClose={handleClose}
            />
          ) : null}
        </Backdrop>
      ) : (
        <Box sx={{ height: window.innerHeight, width: window.innerWidth }}>
          <Box style={{ display: "flex", height: "95%" }} sx={{ bgcolor: "#fff" }}>
            <Box
              display="flex"
              sx={{
                flexDirection: "column",
                width: "30%",
                alignItems: "center",
                bgcolor: "#fff",
                ml: 2,
                mt: 9,
              }}
            >
              <ButtonGroup
                orientation="vertical"
                aria-label="vertical contained button group"
                variant="contained"
                size="large"
                fullWidth={true}
              >
                {buttons.map((button) => (
                  <Button
                    onClick={() => setListDisplay(button)}
                    key={button.id}
                    sx={buttonStyle}
                  >
                    {" "}
                    {button.title}{" "}
                    <Badge
                      badgeContent={button.count}
                      color="secondary"
                      sx={badgeStyle}
                    />
                  </Button>
                ))}
              </ButtonGroup>

              {listDisplay.title === "Authors" ||
              listDisplay.title === "Nodes" ? (
                <Button
                  onClick={handleToggle}
                  variant="contained"
                  fullWidth={true}
                  sx={{ mt: 5 }}
                >
                  Add
                </Button>
              ) : null}

              {listDisplay.title === "Posts" ? (
                <FormControl fullWidth margin="normal">
                  <InputLabel id="demo-simple-select-label">Author</InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={authorID}
                    label="author"
                    onChange={handleChange}
                  >
                    {authors?.map((author) => (
                      <MenuItem value={author.id}>
                        {author.id} ({author.displayName})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : null}
            </Box>

            <Box
              overflow="auto"
              display="flex"
              sx={{
                flexDirection: "column",
                width: "70%",
                alignItems: "center",
                mt: 0.5,
              }}
            >
              <Typography variant="h4">{listDisplay.title}</Typography>
              <Divider style={{ width: "85%" }}></Divider>
              <List
                style={{ maxHeight: "100%", overflow: "auto" }}
                sx={{ width: "90%" }}
              >
                {lists[listDisplay.id]}
              </List>
            </Box>
          </Box>
        </Box>
      )}
    </>
  );
}
