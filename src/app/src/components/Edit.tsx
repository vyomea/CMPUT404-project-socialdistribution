import styled from "styled-components";
import { Button, ButtonGroup, ButtonProps, InputLabel, TextField } from "@mui/material";
import { styled as Styled } from "@mui/material/styles";
import React from "react";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Fab from "@mui/material/Fab";
import CheckIcon from "@mui/icons-material/Check";
import Checkbox from "@mui/material/Checkbox";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import ReactMarkdown from "react-markdown";
import api from "../api/api";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import "katex/dist/katex.min.css"; // `rehype-katex` does not import the CSS for you

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
const ContentType = styled.div`
  width: 80%;
  text-align: center;
  margin-top: 2%;
  font-size: 150%;
`;

const WriteOrPreview = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const ActualContent = styled.div`
  margin-top: 2%;
  width: 50%;
`;
const CustomButton = Styled(Button)<ButtonProps>(({ theme }) => ({
  color: theme.palette.getContrastText("#fff"),
  padding: "10px",
  backgroundColor: "white",
  "&:hover": {
    backgroundColor: "#b5b5b5",
  },
}));

const fieldStyle = { width: "40%", mt: 3 };
const formStyle = { m: 1, minWidth: 120, width: "40%", mt: 2 };

const Edit = ({ id, currentUser, data, handlePostsChanged, handleClose }: any) => {
  const [content, setContent] = React.useState(data.content);
  const [openWrite, setOpenWrite] = React.useState(true);
  const [images, setImages] = React.useState<any>([]);
  const [renderImages, setRenderImages] = React.useState<any>([]);
  const [title, setTitle] = React.useState(data.title);
  const [description, setDescription] = React.useState(data.description);
  const [visibility, setVisibility] = React.useState<any>(data.visibility);
  const [type, setType] = React.useState<any>(data.contentType);
  const [category, setCategory] = React.useState(data.categories.toString());
  const [unlisted, setUnlisted] = React.useState<boolean>(data.unlist);

  const handleUnlist = (event: any) => {
    setUnlisted(true);
  };
  const handleDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(event.target.value);
  };
  const handleType = (event: SelectChangeEvent) => {
    setType(event.target.value);
  };

  const handleCategory = (event: React.ChangeEvent<HTMLInputElement>) => {
    let csv = event.target.value;
    setCategory(csv.split(","));
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setContent(event.target.value);
  };

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  };

  const handleVisibility = (event: SelectChangeEvent) => {
    setVisibility(event.target.value);
  };

  const handleUpload = (event: any) => {
    setImages([...event.target.files]);
  };

  const handleEdit = () => {
    const post = {
      id: id,
      title: title,
      source: "www.google.com",
      origin: "www.lol.com",
      description: description,
      contentType: type,
      content: content,
      image: images ? images[0] : undefined,
      categories: Array.isArray(category)
        ? JSON.stringify(category)
        : JSON.stringify(category.split(",")),
      count: 5,
      published: new Date(),
      visibility: visibility,
      unlisted: unlisted,
    };
    // console.log("",currentUser)
    const formData = new FormData();
    let key: keyof typeof post;
    for (key in post) {
      formData.append(key, post[key]);
    }
    api.authors
      .withId("" + currentUser?.id)
      .posts.withId("" + id)
      .update(formData)
      .then(() => {
        handlePostsChanged();
        handleClose();
      })
      .catch((e) => console.log(e.response));
  };

  React.useEffect(() => {
    if (images.length < 1) return;
    var allImages: any = [];
    images.forEach((image: Blob | MediaSource) => allImages.push(URL.createObjectURL(image)));
    setRenderImages(allImages);
  }, [images]);

  return (
    <EditContainer>
      <Block>
        <Header>Edit Post</Header>
        <TextField
          sx={fieldStyle}
          id="standard-basic"
          required
          label="Title"
          value={title}
          onChange={handleTitleChange}
          fullWidth
        />
        <TextField
          sx={fieldStyle}
          id="standard-basic"
          label="Description"
          value={description}
          onChange={handleDescriptionChange}
          fullWidth
        />
        <FormControl variant="standard" sx={formStyle}>
          <InputLabel id="demo-simple-select-standard-label" required>
            Type
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
            <MenuItem value="image/png;base64">Image</MenuItem>
          </Select>
        </FormControl>
        <FormControl variant="standard" sx={formStyle}>
          <InputLabel id="demo-simple-select-standard-label" required>
            Visibility
          </InputLabel>
          <Select
            labelId="demo-simple-select-standard-label"
            id="demo-simple-select-standard"
            value={visibility}
            onChange={handleVisibility}
            label="Visibility"
          >
            <MenuItem value="PUBLIC">Public</MenuItem>
            <MenuItem value="FRIENDS">Friends</MenuItem>
          </Select>
        </FormControl>
        <TextField
          sx={fieldStyle}
          id="standard-basic"
          label="Categories"
          value={category}
          onChange={handleCategory}
          fullWidth
        />

        <ContentType> Unlisted </ContentType>
        <Checkbox defaultChecked={!!unlisted} onChange={handleUnlist} />
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
                <>
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
                  <CustomButton>
                    <input type="file" accept="image/*" name="image" onChange={handleUpload} />
                  </CustomButton>
                </>
              ) : type === "text/markdown" ? (
                <>
                  <ReactMarkdown
                    children={content}
                    //@ts-ignore
                    remarkPlugins={[remarkMath]}
                    //@ts-ignore
                    rehypePlugins={[rehypeKatex]}
                    components={{
                      code({ node, inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || "");
                        return !inline && match ? (
                          //@ts-ignore
                          <SyntaxHighlighter
                            children={String(children).replace(/\n$/, "")}
                            language={match[1]}
                            PreTag="div"
                            {...props}
                          />
                        ) : (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      },
                    }}
                  />
                  {renderImages.map((image: string | undefined) => (
                    <img style={{ width: "400px", height: "400px" }} src={image} alt="Uploaded" />
                  ))}
                </>
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
        sx={{ color: "black", background: "#46ECA6", "&:hover": { background: "#18E78F" } }}
      >
        <CheckIcon onClick={handleEdit} />
      </Fab>
    </EditContainer>
  );
};

export default Edit;
