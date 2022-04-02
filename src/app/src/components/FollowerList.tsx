import React, { useState, useEffect } from "react";

import api from "../api/api";

const FollowerList = ({ data }: any) => {
  const [followersList, setFollowers] = useState<string[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = api.authors.withId("" + data?.id).followers.list();
        res.then((followers) => {
          setFollowers(followers.map((follower) => follower.displayName));
        });
      } catch (err) {
        console.log(err);
      }
    }
    fetchData();
  }, [data?.id]);
  return <div>{followersList}</div>;
};

export default FollowerList;
