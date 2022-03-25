import React, { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import Author from "./api/models/Author";
import Homepage from "./pages/Homepage";
import Mainpage from "./pages/Mainpage";
import Profile from "./pages/Profile";
import Profiles from "./pages/Profiles";
import Admin from "./pages/Admin";
import ErrorPage from "./pages/Error";
import api from "./api/api";

function App() {
  const [currentUser, setCurrentUser] = useState<Author | undefined>(undefined);
  const [fetchingCurrentUser, setFetchingCurrentUser] = useState(true);

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
      <Routes>
        <Route
          index
          element={
            currentUser ? (
              <Mainpage currentUser={currentUser} />
            ) : (
              <Homepage setCurrentUser={setCurrentUser} />
            )
          }
        />
        <Route
          path="/profile/:id"
          element={<Profile currentUser={currentUser} />}
        />
        <Route
          path="/profiles"
          element={<Profiles currentUser={currentUser} />}
        />
        <Route path="/admin" element={currentUser ? <Admin /> : null} />
        <Route path="*" element={<ErrorPage errorType="NotFound" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
