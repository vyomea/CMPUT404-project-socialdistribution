export default interface Author {
  type: "author";
  id: string;
  displayName: string;
  github: string;
  profileImage: string;
  isAdmin: boolean;
}

export type AuthorResponse = Omit<Author, "id"> & {
  id: string; // URL to the author
};

export const authorFromResponse = (data: AuthorResponse): Author => {
  const match = /\/authors\/([^/]+)\/?$/.exec(data.id);
  if (match === null) {
    throw new Error(`Invalid author URL ${data.id}`);
  }
  return {
    ...data,
    id: match[1],
  };
};

export type AuthorRequest = Omit<Author, "id"> & {
  id: string; // URL to the author
};

export const authorToRequest = (
  author: Author,
  baseUrl: string
): AuthorRequest => {
  return {
    ...author,
    id: `${baseUrl}/authors/${author.id}`,
  };
};
