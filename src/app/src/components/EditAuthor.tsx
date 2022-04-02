import styled from 'styled-components';
import { TextField, Checkbox } from '@mui/material';
import React from 'react';
import Fab from '@mui/material/Fab';
import CheckIcon from '@mui/icons-material/Check';
import api from '../api/api';
import Author from '../api/models/Author';
interface Props {
  data: Author;
  handleAuthorsChanged: any;
  handleClose: any;
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

const ContentType = styled.div`
  width: 80%;
  text-align: center;
  margin-top: 2%;
  font-size: 150%;
`;

const fieldStyle = { width: '40%', mt: 5 };

const EditAuthor = ({ data, handleAuthorsChanged, handleClose }: Props) => {
  const [displayName, setName] = React.useState(data.displayName);
  const [github, setGithub] = React.useState(data.github ? data.github : '');
  const [profileImage, setImage] = React.useState(
    data.profileImage ? data.profileImage : ''
  );
  const [verified, setVerified] = React.useState(data.verified);

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const handleGithub = (event: React.ChangeEvent<HTMLInputElement>) => {
    setGithub(event.target.value);
  };

  const handleImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setImage(event.target.value);
  };

  const handleVerified = (event: React.ChangeEvent<HTMLInputElement>) => {
    setVerified(event.target.checked);
  };

  const handleEdit = () => {
    const author = {
      type: data.type,
      id: data.id,
      displayName: displayName,
      github:
        github.trim() === '' || github.trim().length === 0 ? undefined : github,
      profileImage:
        profileImage.trim() === '' || profileImage.trim().length === 0
          ? undefined
          : profileImage,
      isAdmin: data.isAdmin,
      verified: verified,
    };

    console.log(author);

    api.authors
      .withId(author.id)
      .update(author)
      .then(() => {
        handleAuthorsChanged();
        handleClose();
      })
      .catch(e => console.log(e.response));
  };

  return (
    <EditContainer>
      <Block>
        <Header>Edit Author</Header>
        <TextField
          sx={fieldStyle}
          id='standard-basic'
          required
          label='displayName'
          value={displayName}
          onChange={handleNameChange}
          fullWidth
        />
        <TextField
          sx={fieldStyle}
          id='standard-basic'
          label='github'
          value={github}
          onChange={handleGithub}
          fullWidth
        />
        <TextField
          sx={fieldStyle}
          id='standard-basic'
          label='imageURL'
          value={profileImage}
          onChange={handleImage}
          fullWidth
        />

        <ContentType> Verify </ContentType>
        
        <Checkbox
              id='standard-basic'
              checked={verified}
              onChange={handleVerified}
        />
      </Block>
      <Fab
        color='primary'
        aria-label='check'
        sx={{
          color: 'black',
          background: '#46ECA6',
          '&:hover': { background: '#18E78F' },
          mb: 5,
        }}>
        <CheckIcon onClick={handleEdit} />
      </Fab>
    </EditContainer>
  );
};

export default EditAuthor;
