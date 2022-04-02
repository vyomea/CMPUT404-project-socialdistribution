import React, { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import Author from './api/models/Author';
import Homepage from './pages/Homepage';
import Mainpage from './pages/Mainpage';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import ErrorPage from './pages/Error';
import api from './api/api';
import NavBar from './components/NavBar';
import styled from 'styled-components';

const NavBarContainer = styled.div`
  margin-bottom: 5%;
`;

function App() {
  const [currentUser, setCurrentUser] = useState<Author | undefined>(undefined);
  const [fetchingCurrentUser, setFetchingCurrentUser] = useState(true);
  const url = new URL(window.location.href);

  const adminUser = [
    {
      Text: 'Admin',
      handleClick: () => {
        window.location.assign(`${url.origin}/admin`);
      },
    },
    {
      Text: 'Home',
      handleClick: () => {
        window.location.assign(`${url.origin}/`);
      },
    },
    {
      Text: 'Profile',
      handleClick: () => {
        window.location.assign(`${url.origin}/profile/${currentUser?.id}`);
      },
    },
    {
      Text: 'Logout',
      handleClick: () => {
        api.logout();
        window?.location?.reload();
      },
    },
  ];
  const normalUser = [
    {
      Text: 'Home',
      handleClick: () => {
        window.location.assign(`${url.origin}/`);
      },
    },
    {
      Text: 'Profile',
      handleClick: () => {
        window.location.assign(`${url.origin}/profile/${currentUser?.id}`);
      },
    },
    {
      Text: 'Logout',
      handleClick: () => {
        api.logout();
        window?.location?.reload();
      },
    },
  ];
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.authors
        .getCurrent()
        .then((author) => setCurrentUser(author))
        .catch((error) => {
          localStorage.removeItem('token');
        })
        .finally(() => setFetchingCurrentUser(false));
    } else {
      setFetchingCurrentUser(false);
    }
  }, []);

  return fetchingCurrentUser ? (
    <Box textAlign="center">
      <CircularProgress />
    </Box>
  ) : (
    <BrowserRouter>
      {
        <NavBarContainer>
          <NavBar items={currentUser && currentUser.isAdmin ? adminUser : normalUser} />
        </NavBarContainer>
      }
      <Routes>
        <Route
          index
          element={
            currentUser ? (
              <>
                <Mainpage currentUser={currentUser} />
              </>
            ) : (
              <Homepage setCurrentUser={setCurrentUser} />
            )
          }
        />
        <Route path="/profile/:id" element={<Profile currentUser={currentUser} />} />
        <Route
          path="/admin"
          element={
            currentUser && currentUser.isAdmin ? <Admin /> : <ErrorPage errorType="NotFound" />
          }
        />
        <Route path="*" element={<ErrorPage errorType="NotFound" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
