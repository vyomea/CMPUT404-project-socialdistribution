import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  NavigateFunction,
  Route,
  Routes,
} from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import Author from "./api/models/Author";
import Homepage from "./pages/Homepage";
import Mainpage from "./pages/Mainpage";
import Profile from "./pages/Profile";
import Profiles from "./pages/Profiles";
import Admin from "./pages/Admin";
import ErrorPage from "./pages/Error";
import api from "./api/api";
import NavBar, { NavItem } from "./components/NavBar";
import Comments from "./pages/Comments";

function App() {
  const [currentUser, setCurrentUser] = useState<Author | undefined>(undefined);
  const [fetchingCurrentUser, setFetchingCurrentUser] = useState(true);

  const normalUser: NavItem[] = [
    {
      text: "Home",
      handleClick: (navigate: NavigateFunction) => {
        navigate("/");
      },
    },
    {
      text: "Authors",
      handleClick: (navigate: NavigateFunction) => {
        navigate(`/profile`);
      },
    },
    {
      text: "My Profile",
      handleClick: (navigate: NavigateFunction) => {
        navigate(`/profile/${currentUser?.id}`);
      },
    },
    {
      text: "Logout",
      handleClick: (navigate: NavigateFunction) => {
        api.logout();
        window.location.reload();
      },
    },
  ];
  const adminUser: NavItem[] = [
    {
      text: "Admin",
      handleClick: (navigate: NavigateFunction) => {
        navigate("/admin");
      },
    },
    ...normalUser,
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api.authors
        .getCurrent()
        .then((author) => setCurrentUser(author))
        .catch((error) => {
          localStorage.removeItem("token");
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
      {currentUser ? (
        <NavBar
          items={currentUser && currentUser.isAdmin ? adminUser : normalUser}
        />
      ) : null}
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
        <Route
          path="/profile"
          element={<Profiles currentUser={currentUser} />}
        />
        <Route
          path="/profile/:id"
          element={<Profile currentUser={currentUser} />}
        />
        <Route
          path="/profile/:authorID/post/:postID"
          element={<Comments currentUser={currentUser} />}
        />
        <Route
          path="/admin"
          element={
            currentUser && currentUser.isAdmin ? (
              <Admin />
            ) : (
              <ErrorPage errorType="NotFound" />
            )
          }
        />
        <Route path="*" element={<ErrorPage errorType="NotFound" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
