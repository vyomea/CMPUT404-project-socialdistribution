import styled from "styled-components";
import { TextField } from "@mui/material";
import React from "react";
import Fab from "@mui/material/Fab";
import CheckIcon from "@mui/icons-material/Check";
import api from "../api/api";

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

const fieldStyle = { width: "40%", mt: 5 };

const AddNode = ({ handleNodesChanged, handleClose }: Props) => {
  const [serviceUrl, setServiceUrl] = React.useState("");
  const [incomingUsername, setIncomingUsername] = React.useState("");
  const [incomingPassword, setIncomingPassword] = React.useState("");
  const [outgoingUsername, setOutgoingUsername] = React.useState("");
  const [outgoingPassword, setOutgoingPassword] = React.useState("");

  const handlerFor =
    (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setter(event.target.value);
    };

  const handleEdit = () => {
    api.nodes
      .createOrUpdate({
        serviceUrl,
        incomingUsername,
        incomingPassword,
        outgoingUsername,
        outgoingPassword,
      })
      .then(() => {
        handleNodesChanged();
        handleClose();
      })
      .catch((e) => console.error(e.response));
  };

  return (
    <EditContainer>
      <Block>
        <Header>Add Node</Header>
        <TextField
          sx={fieldStyle}
          id="standard-basic"
          required
          label="Service URL"
          type="url"
          value={serviceUrl}
          onChange={handlerFor(setServiceUrl)}
          fullWidth
        />

        <TextField
          sx={fieldStyle}
          id="standard-basic"
          required
          label="Incoming Username"
          value={incomingUsername}
          onChange={handlerFor(setIncomingUsername)}
          fullWidth
        />
        <TextField
          sx={fieldStyle}
          id="standard-basic"
          required
          label="Incoming Password"
          type="password"
          value={incomingPassword}
          onChange={handlerFor(setIncomingPassword)}
          fullWidth
        />
        <TextField
          sx={fieldStyle}
          id="standard-basic"
          required
          label="Outgoing Username"
          type="text"
          value={outgoingUsername}
          onChange={handlerFor(setOutgoingUsername)}
          fullWidth
        />
        <TextField
          sx={fieldStyle}
          id="standard-basic"
          required
          label="Outgoing Password"
          type="password"
          value={outgoingPassword}
          onChange={handlerFor(setOutgoingPassword)}
          fullWidth
        />
      </Block>
      <Fab
        color="primary"
        aria-label="check"
        sx={{
          color: "black",
          background: "#46ECA6",
          "&:hover": { background: "#18E78F" },
          mb: 5,
        }}
      >
        <CheckIcon onClick={handleEdit} />
      </Fab>
    </EditContainer>
  );
};

export default AddNode;
