import React, { useState, useEffect } from "react";

import api from "../api/api";

const FollowingList = ({ data }: any) => {
  const [followersList, setFollowing] = useState<string[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = api.authors.withId("" + data?.id).followings.list();
        res.then((followings) => {
            setFollowing(followings.map((following) => following.displayName));
        });
      } catch (err) {
        console.log(err);
      }
    }
    fetchData();
  }, [data?.id]);
  return <div>{followersList}</div>;
};

export default FollowingList;
