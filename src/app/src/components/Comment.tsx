import React from "react";
import styled from "styled-components";
// import logo from "../logo.svg";

interface commentItem {
  Name: string;
  ContentText: string;
  ProfilePicturePath?: string;
}

// This is for the whole comment, which includes the profile picure, content, etc
const CommentContainer = styled.div`
  width: 100%;
  height: 300px;
  display: flex;
`;

// This is for the details of comment: everything except the profile picture
const CommentDetailsContainer = styled.div`
  height: 100%;
  width: 90%;
  display: flex;
  border: 1px solid black;
  flex-direction: column;
  position: relative;
`;

// This is for the Profile Picture only
const PostProfilePictureContainer = styled.div`
  height: 100%;
`;

// This is for the Author name, edit button and delete button, which be at the top
const TopRowContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

// This is for the author name
const NameContainer = styled.div`
  padding: 1%;
`;

// This is for the post content, which can be text and images
const ContentContainer = styled.div`
  padding: 1%;
  margin-top: 20px;
`;

const Comment: React.FC<commentItem> = (props?) => {
  return (
    <CommentContainer>
      <PostProfilePictureContainer>
        <img alt="Profile" height="100" width="100" />
      </PostProfilePictureContainer>
      <CommentDetailsContainer>
        <TopRowContainer>
          <NameContainer>{props?.Name}</NameContainer>
        </TopRowContainer>
        <ContentContainer>{props?.ContentText}</ContentContainer>
      </CommentDetailsContainer>
    </CommentContainer>
  );
};

export default Comment;
