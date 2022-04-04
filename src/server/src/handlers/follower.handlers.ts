import { Op } from 'sequelize';
import Follower from '../models/Follower';

const isFriends = async (author1: string, author2: string) => {
  if (author1 === author2) {
    return true;
  }

  const result = await Follower.findAndCountAll({
    where: {
      [Op.or]: [
        { [Op.and]: [{ authorId: author1 }, { followerId: author2 }] },
        { [Op.and]: [{ authorId: author2 }, { followerId: author1 }] },
      ],
    },
  });
  return result.count === 2;
};

export { isFriends };
