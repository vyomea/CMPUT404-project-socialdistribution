import React, { useState, useEffect } from "react";

import api from "../api/api";
import Author from "../api/models/Author";

const FollowingList = ({ data }: any) => {
  const [followersList, setFollowing] = useState<Author[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = api.authors.withId("" + data?.id).followings.list();
        res.then((followings) => {
          setFollowing(followings);
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

export default FollowingList;
