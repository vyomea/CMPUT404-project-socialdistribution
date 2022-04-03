import styled from 'styled-components';
import {
  Button,
  ButtonGroup,
  ButtonProps,
  InputLabel,
  TextField,
} from '@mui/material';
import { styled as Styled } from '@mui/material/styles';
import React from 'react';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Fab from '@mui/material/Fab';
import CheckIcon from '@mui/icons-material/Check';
import Checkbox from '@mui/material/Checkbox';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import ReactMarkdown from 'react-markdown';
import Author from '../api/models/Author';
import { v4 as uuidv4 } from 'uuid';
import api from '../api/api';

interface Props {
  currentUser?: Author;
  handlePostsChanged:any;
  handleClose:any;
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
  color: theme.palette.getContrastText('#fff'),
  padding: '10px',
  backgroundColor: 'white',
  '&:hover': {
    backgroundColor: '#b5b5b5',
  },
}));

const fieldStyle = { width: '40%', mt:3 };
const formStyle = { m: 1, minWidth: 120, width: '40%', mt:2 };

const Add = ({ currentUser, handlePostsChanged, handleClose }: Props) => {
  const [content, setContent] = React.useState('');
  const [openWrite, setOpenWrite] = React.useState(true);
  const [images, setImages] = React.useState<any>([]);
  const [renderImages, setRenderImages] = React.useState<any>([]);
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [visibility, setVisibility] = React.useState<any>('PUBLIC');
  const [type, setType] = React.useState<any>('');
  const [category, setCategory] = React.useState<Array<string>>([]);
  const [unlisted, setUnlisted] = React.useState<boolean>(false);

  const handleDescriptionChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setDescription(event.target.value);
  };

  const handleUnlist = (event: any) => {
    setUnlisted(true);
  };
  const handleType = (event: SelectChangeEvent) => {
    setType(event.target.value);
  };

  const handleCategory = (event: React.ChangeEvent<HTMLInputElement>) => {
    let csv = event.target.value;
    setCategory(csv.split(','));
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

  const createPost = () => {
    const post = {
      id: uuidv4(),
      title: title,
      source: 'www.google.com',
      origin: 'www.lol.com',
      description: description,
      contentType: type,
      content: content,
      image: images ? images[0] : undefined,
      categories: JSON.stringify(category),
      count: 5,
      published: new Date(),
      visibility: visibility,
      unlisted: unlisted,
    };
    // debugger;
    const formData = new FormData();
    let key: keyof typeof post;
    for (key in post) {
      formData.append(key, post[key]);
    }
    api.authors
    .withId('' + currentUser?.id)
    .posts
    .create(formData)
    .then(()=>{handlePostsChanged(); handleClose()})
    .catch((error) => console.log(error));
  };

  React.useEffect(() => {
    if (images.length < 1) return;
    var allImages: any = [];
    images.forEach((image: Blob | MediaSource) =>
      allImages.push(URL.createObjectURL(image))
    );
    setRenderImages(allImages);
  }, [images]);

  return (
    <EditContainer>
      <Block>
        <Header>Add Post</Header>
        <TextField
          sx={fieldStyle}
          id='standard-basic'
          required
          label='Title'
          value={title}
          onChange={handleTitleChange}
          fullWidth
        />
        <TextField
          sx={fieldStyle}
          id='standard-basic'
          label='Description'
          value={description}
          onChange={handleDescriptionChange}
          fullWidth
        />
        <FormControl variant='standard' sx={formStyle}>
          <InputLabel id='demo-simple-select-standard-label' required>
            Type
          </InputLabel>
          <Select
            labelId='demo-simple-select-standard-label'
            id='demo-simple-select-standard'
            value={type}
            onChange={handleType}
            label='Type'>
            <MenuItem value='text/plain'>Plain</MenuItem>
            <MenuItem value='text/markdown'>Markdown</MenuItem>
            <MenuItem value='image'>Image</MenuItem>
          </Select>
        </FormControl>
        <FormControl variant='standard' sx={formStyle}>
          <InputLabel id='demo-simple-select-standard-label' required>
            Visibility
          </InputLabel>
          <Select
            labelId='demo-simple-select-standard-label'
            id='demo-simple-select-standard'
            value={visibility}
            onChange={handleVisibility}
            label='Visibility'>
            <MenuItem value='PUBLIC'>Public</MenuItem>
            <MenuItem value='FRIENDS'>Friends</MenuItem>
          </Select>
        </FormControl>
        <TextField
          sx={fieldStyle}
          id='standard-basic'
          label='Category'
          value={category}
          onChange={handleCategory}
          fullWidth
        />

        <ContentType> Unlisted </ContentType>
        <Checkbox defaultChecked={!!unlisted} onChange={handleUnlist} />
        <Content>
          {' '}
          <WriteOrPreview>
            <ButtonGroup
              variant='text'
              color='inherit'
              size='large'
              sx={{ p: 1, borderBottom: '1px solid black' }}>
              <CustomButton
                onClick={() => setOpenWrite(true)}
                sx={{ background: openWrite ? '#b5b5b5' : 'white' }}>
                {' '}
                Write{' '}
              </CustomButton>
              <CustomButton
                onClick={() => setOpenWrite(false)}
                sx={{ background: !openWrite ? '#b5b5b5' : 'white' }}>
                {' '}
                Preview
              </CustomButton>
            </ButtonGroup>
            <ActualContent>
              {openWrite ? (
                <>
                  <TextField
                    required
                    id='multiline-flexible'
                    label='Content'
                    multiline
                    fullWidth
                    maxRows={10}
                    value={content}
                    onChange={handleTextChange}
                  />
                  <CustomButton>
                    <input
                      type='file'
                      accept='image/*'
                      name='image'
                      multiple
                      onChange={handleUpload}
                    />
                  </CustomButton>
                </>
              ) : (
                <>
                  <ReactMarkdown>{content}</ReactMarkdown>
                  {renderImages.map((image: string | undefined) => (
                    <img
                      style={{ width: '400px', height: '400px' }}
                      src={image}
                      alt='Uploaded'
                    />
                  ))}
                </>
              )}
            </ActualContent>
          </WriteOrPreview>
        </Content>
      </Block>
      <Fab
        color='primary'
        aria-label='check'
        sx={{
          color: 'black',
          background: '#46ECA6',
          '&:hover': { background: '#18E78F' },
        }}>
        <CheckIcon onClick={createPost} />
      </Fab>
    </EditContainer>
  );
};

export default Add;
