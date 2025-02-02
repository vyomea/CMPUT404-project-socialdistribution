import { Octokit } from "@octokit/rest";
import { useEffect, useState } from "react";
import styled from "styled-components";
import CircularProgress from "@mui/material/CircularProgress";
import Activity from "./Activity";

const octokit = new Octokit({
  auth: process.env.REACT_APP_GH,
  userAgent: "Yoda",
});

interface props {
  username: any;
}

const GithubContainer = styled.div`
  width: 20%;
  height: 500px;
  position: fixed;
  border: 1px solid grey;
  background-color: white;
  overflow-y: scroll;
`;
const GithubHeader = styled.div`
  width: 100%;
  text-align: center;
  margin-top: 2%;
  height: 5%;
  align-items: center;
  justify-content: center;
  font-size: 150%;
`;
const Github = ({ username }: props) => {
  const [items, setItems] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function onLoad() {
      if (username) {
        await octokit
          .request("GET /users/{username}/events/public", {
            username: username,
          })
          .then((res) => {
            setItems(res.data);
            setLoading(false);
          })
          .catch((e) => console.log(e));
      }
    }
    onLoad();
  }, [username]);
  let key = 0;
  return (
    <GithubContainer>
      <GithubHeader>Github Activity</GithubHeader>

      {loading ? (
        <GithubHeader>
          <CircularProgress color="success" />
        </GithubHeader>
      ) : (
        items.map((item: any) => {
          return (
            <Activity key={key++} type={item?.type} payload={item?.payload} repo={item?.repo} />
          );
        })
      )}
    </GithubContainer>
  );
};

export default Github;
