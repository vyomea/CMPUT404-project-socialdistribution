import styled from 'styled-components';
import { Button, ButtonProps, TextField } from '@mui/material';
import { styled as Styled } from '@mui/material/styles';
import React from 'react';
import Fab from '@mui/material/Fab';
import CheckIcon from '@mui/icons-material/Check';
import api from '../api/api';
import Author from '../api/models/Author';


interface Props {
  data: Author;
  handleAuthorsChanged: any;
}

const EditContainer = styled.div`
  background-color: white;
  width: 80%;
  height: 80%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
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
  text-decoration: underline;
  font-family: Avenir Next Light;
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
  font-family: Avenir Next Light;
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
const EditAuthor = ({ data, handleAuthorsChanged }: Props) => {
  const [displayName, setName] = React.useState(data.displayName);
  const [github, setGithub] = React.useState((data.github)?data.github:"");
  const [profileImage, setImage] = React.useState((data.profileImage)?data.profileImage:"");

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    
    setName(event.target.value);
  };
  
  const handleGithub = (event: React.ChangeEvent<HTMLInputElement>) => {
    setGithub(event.target.value);
  };

  const handleImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setImage(event.target.value);
  };


  const handleEdit = () => {
    const author = {
      id: data.id,
      displayName: displayName,
      github: ((github.trim()==="")||(github.trim().length===0))?undefined:github,
      profileImage: ((profileImage.trim()==="")||(profileImage.trim().length===0))?undefined:profileImage
    };

    console.log(github);
  
    api.authors
    .withId(author.id)
    .update(author)
    .then(()=>handleAuthorsChanged())
    .catch((e) => console.log(e.response));
  
    };

  return (
    <EditContainer>
      <Block>
      <Header>Edit</Header>
        <ContentType>Display Name</ContentType>
        <TextField
          sx={{ width: '40%' }}
          id="standard-basic"
          required
          label="displayName"
          value={displayName}
          onChange={handleNameChange}
          fullWidth
        />
        <ContentType>Github</ContentType>
        <TextField
          sx={{ width: '40%' }}
          id="standard-basic"
          label="github"
          value={github}
          onChange={handleGithub}
          fullWidth
        />
        <ContentType>Profile Image</ContentType>
        <TextField
          sx={{ width: '40%' }}
          id="standard-basic"
          label="imageURL"
          value={profileImage}
          onChange={handleImage}
          fullWidth
        />
      </Block>
      <Fab
        color="primary"
        aria-label="check"
        sx={{ color: 'black', background: '#46ECA6', '&:hover': { background: '#18E78F' } }}
      >
        <CheckIcon onClick={handleEdit} />
      </Fab>
    </EditContainer>
  );
};

export default EditAuthor;
