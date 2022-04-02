import Author from '../models/Author';

const isAdmin = async (id: string): Promise<boolean> => {
  const author = await Author.findByPk(id);
  return author !== null && author.isAdmin;
};

export { isAdmin };
