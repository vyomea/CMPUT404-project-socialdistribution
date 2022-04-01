import styled from 'styled-components';
import { TextField } from '@mui/material';
import React from 'react';
import Fab from '@mui/material/Fab';
import CheckIcon from '@mui/icons-material/Check';
import api from '../api/api';

interface Props {
  handleNodesChanged: any;
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

const fieldStyle = { width: '40%', mt:5 };

const AddNode = ({ handleNodesChanged, handleClose }: Props) => {
  const [username, setName] = React.useState("");
  const [password, setPassword] = React.useState("");

  const handleName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };
  
  const handlePassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };


  const handleEdit = () => {
    api
    .nodes
    .create(username,password)
    .then(()=>{handleNodesChanged(); handleClose()})
    .catch((e) => console.log(e.response))
    };

  return (
    <EditContainer>
      <Block>
      <Header>Add Node</Header>
        <TextField
          sx={fieldStyle}
          id="standard-basic"
          required
          label="username"
          value={username}
          onChange={handleName}
          fullWidth
        />
        <TextField
          sx={fieldStyle}
          id="standard-basic"
          required
          label="password"
          type="password"
          value={password}
          onChange={handlePassword}
          fullWidth
        />
      </Block>
      <Fab
        color="primary"
        aria-label="check"
        sx={{ color: 'black', background: '#46ECA6', '&:hover': { background: '#18E78F' }, mb: 5 }}
      >
        <CheckIcon onClick={handleEdit} />
      </Fab>
    </EditContainer>
  );
};

export default AddNode;
