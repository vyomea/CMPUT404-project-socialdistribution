import React, { useState, useEffect } from "react";
import api from "../api/api";
import Author from "../api/models/Author";


const FollowerList = ({ data }: any) => {
  const [followersList, setFollowers] = useState<Author[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = api.authors.withId("" + data?.id).followers.list();
        res.then((followers) => {
          setFollowers(followers);
        });
      } catch (err) {
        console.log(err);
      }
    }
    fetchData();
  }, [data?.id]);

  return (
    <div>
      {followersList.map((follower) => (
        <a
          href={
            window.location.href.substring(
              0,
              window.location.href.search(data) - 1
            ) + follower.id
          }
        >
          {follower.displayName}
        </a>
      ))}
    </div>
  );
};

export default FollowerList;
