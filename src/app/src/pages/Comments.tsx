import { useState, useEffect } from "react";
import api from "../api/api";
import Author from "../api/models/Author";
import Comment from "../api/models/Comment";
import Post from "../api/models/Post";
import UserPost from "../components/UserPost";
import AddIcon from "@mui/icons-material/Add";
import CircularProgress from "@mui/material/CircularProgress";
import { List, Backdrop, Button } from "@mui/material";
import CommentComponent from "../components/CommentComponent";
import { CloseRounded } from "@mui/icons-material";
import styled from "styled-components";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Fab from "@mui/material/Fab";
import CheckIcon from "@mui/icons-material/Check";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import ReactMarkdown from "react-markdown";
import { ButtonGroup, ButtonProps, InputLabel, TextField } from "@mui/material";
import { styled as Styled } from "@mui/material/styles";
import { useParams } from "react-router-dom";

interface Props {
  currentUser?: Author;
}

const EditContainer = styled.div`
  background-color: white;
  width: 80%;
  height: 80%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
`;
const Block = styled.div`
  width: 100%;
  height: 100%;
  color: black;
  display: flex;
  flex-direction: column;
  overflow-y: scroll;
  text-align: left;
  align-items: center;
`;
const Header = styled.div`
  margin-top: 1%;
  font-size: 200%;
  text-align: center;
`;

const Content = styled.div`
  margin-top: 1%;
  width: 80%;
  height: 20%;
  display: flex;
  flex-direction: column;
`;

const ActualContent = styled.div`
  margin-top: 2%;
  width: 50%;
`;
const WriteOrPreview = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const CustomButton = Styled(Button)<ButtonProps>(({ theme }) => ({
  color: theme.palette.getContrastText("#fff"),
  padding: "10px",
  backgroundColor: "white",
  "&:hover": {
    backgroundColor: "#b5b5b5",
  },
}));
const formStyle = { m: 1, minWidth: 120, width: "40%", mt: 2 };

export default function Comments({ currentUser }: Props): JSX.Element {
  let { postID, authorID } = useParams();
  const [comments, setComments] = useState<Comment[]>([]);
  const [post, setPost] = useState<Post>();
  const [commentsChanged, setCommentsChanged] = useState(false);
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<any>("");
  const [openWrite, setOpenWrite] = useState(true);
  const [content, setContent] = useState("");

  const handleClose = () => {
    setOpen(false);
  };

  const handleType = (event: SelectChangeEvent) => {
    setType(event.target.value);
  };
  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setContent(event.target.value);
  };
  useEffect(() => {
    async function fetchData() {
      try {
        if (authorID && postID) {
          const commentList = api.authors.withId(authorID).posts.withId(postID).comments.list();
          const post = api.authors.withId(authorID).posts.withId(postID).get();
          post.then((data) => setPost(data)).catch((err) => console.log(err));
          commentList.then((comment) => {
            setComments(comment);
            setCommentsChanged(false);
          });
        }
      } catch (err) {
        console.log(err);
      }
    }
    fetchData();
  }, [authorID, postID, commentsChanged]);

  const comment = {
    comment: content,
    contentType: type,
  };
  const createComment = () => {
    if (authorID && postID) {
      api.authors
        .withId(authorID)
        .posts.withId(postID)
        .comments.create(comment)
        .then((res) => {
          setCommentsChanged(true);
          setOpen(!open);
        })
        .catch((err) => console.log("Hello " + err));
    }
  };
  // createComment();

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
          <EditContainer>
            <Block>
              <Header>Add Comment</Header>
              <FormControl variant="standard" sx={formStyle}>
                <InputLabel id="demo-simple-select-standard-label" required>
                  Comment type
                </InputLabel>
                <Select
                  labelId="demo-simple-select-standard-label"
                  id="demo-simple-select-standard"
                  value={type}
                  onChange={handleType}
                  label="Type"
                >
                  <MenuItem value="text/plain">Plain</MenuItem>
                  <MenuItem value="text/markdown">Markdown</MenuItem>
                </Select>
              </FormControl>
              <Content>
                {" "}
                <WriteOrPreview>
                  <ButtonGroup
                    variant="text"
                    color="inherit"
                    size="large"
                    sx={{ p: 1, borderBottom: "1px solid black" }}
                  >
                    <CustomButton
                      onClick={() => setOpenWrite(true)}
                      sx={{ background: openWrite ? "#b5b5b5" : "white" }}
                    >
                      {" "}
                      Write{" "}
                    </CustomButton>
                    <CustomButton
                      onClick={() => setOpenWrite(false)}
                      sx={{ background: !openWrite ? "#b5b5b5" : "white" }}
                    >
                      {" "}
                      Preview
                    </CustomButton>
                  </ButtonGroup>
                  <ActualContent>
                    {openWrite ? (
                      <TextField
                        required
                        id="multiline-flexible"
                        label="Content"
                        multiline
                        fullWidth
                        maxRows={10}
                        value={content}
                        onChange={handleTextChange}
                      />
                    ) : type === "text/markdown" ? (
                      <ReactMarkdown>{content}</ReactMarkdown>
                    ) : (
                      content
                    )}
                  </ActualContent>
                </WriteOrPreview>
              </Content>
            </Block>
            <Fab
              color="primary"
              aria-label="check"
              sx={{
                color: "black",
                background: "#46ECA6",
                "&:hover": { background: "#18E78F" },
              }}
            >
              <CheckIcon onClick={createComment} />
            </Fab>
          </EditContainer>
        </Backdrop>
      ) : null}
      {post ? (
        <UserPost post={post} likes={5} currentUser={currentUser} postAuthor={currentUser} />
      ) : (
        <CircularProgress color="success" />
      )}
      <List
        style={{
          maxHeight: "100%",
          overflow: "auto",
        }}
        sx={{ width: "70%", ml: 5, justifyContent: "center" }}
      >
        <Fab
          color="primary"
          aria-label="check"
          style={{
            margin: 0,
            top: "auto",
            right: 20,
            bottom: 20,
            left: "auto",
            position: "fixed",
          }}
          sx={{ color: "black", background: "#46ECA6", "&:hover": { background: "#18E78F" } }}
        >
          <AddIcon onClick={() => setOpen(true)} />
        </Fab>
        {comments?.map((i) => {
          return <CommentComponent comm={i} likes={0} />;
        })}
      </List>
    </>
  );
}
