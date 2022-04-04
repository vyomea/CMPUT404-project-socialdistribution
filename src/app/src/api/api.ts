import Axios from "axios";
import Author, {
  authorFromResponse,
  AuthorResponse,
  authorToRequest,
} from "./models/Author";
import Comment, {
  commentFromResponse,
  CommentResponse,
  commentsFromResponse,
  CommentsResponse,
  commentCreateToRequest,
} from "./models/Comment";
import Post, { postFromResponse, PostResponse } from "./models/Post";
import InboxItem, {
  inboxItemFromResponse,
  InboxItemResponse,
} from "./models/InboxItem";
import Like, { likeFromResponse, LikeResponse } from "./models/Like";
import Node from "./models/Node";

const baseUrl =
  process.env.NODE_ENV === "development"
    ? `http://localhost:${process.env.REACT_APP_API_PORT || 3001}`
    : "/";

const axios = Axios.create({
  baseURL: baseUrl,
});

axios.interceptors.request.use((config) => {
  config.headers = config.headers || {};
  const token = localStorage.getItem("token");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

const api = {
  /**
   * Log into an existing author's account.
   * @returns the author
   */
  login: async (email: string, password: string): Promise<Author> => {
    const result = await axios.post("/login", { email, password });
    localStorage.setItem("token", result.data.token);
    return authorFromResponse(result.data.author);
  },

  /**
   * Register and log into a new author's account.
   * @returns the new author
   */
  register: async (
    email: string,
    password: string,
    displayName: string
  ): Promise<void> => {
    await axios.post("/register", {
      email,
      password,
      displayName,
    });
  },

  /**
   * Create a new author's account via admin.
   * @returns the new author
   */
  create: async (
    email: string,
    password: string,
    displayName: string
  ): Promise<Author> => {
    const result = await axios.post("/register", {
      email,
      password,
      displayName,
    });
    return result.data.author;
  },

  /**
   * Log out of the current author's account.
   */
  logout: () => {
    localStorage.removeItem("token");
  },

  /**
   * Get an Author, Post, Comment, or Comments by its URL.
   * @param url the URL to the object
   * @returns the object
   */
  getObjectFromUrl: async (
    url: string
  ): Promise<Author | Post | Comment | Comment[]> => {
    const responseData = (
      await axios.get<
        AuthorResponse | PostResponse | CommentResponse | CommentsResponse
      >(url)
    ).data;
    if (responseData.type === "author") {
      return authorFromResponse(responseData);
    } else if (responseData.type === "post") {
      return postFromResponse(responseData);
    } else if (responseData.type === "comment") {
      return commentFromResponse(responseData);
    } else if (responseData.type === "comments") {
      return commentsFromResponse(responseData);
    } else {
      throw new Error("Invalid object type");
    }
  },

  /**
   * Actions on the posts.
   */
  posts: {
    /**
     * Fetches a paginated list of posts.
     * @param page the page to return
     * @param size the number of posts per page
     * @returns a list of posts
     */
    list: async (page?: number, size?: number): Promise<Post[]> =>
      (
        await axios.get<{ items: PostResponse[] }>(`/posts`, {
          params: { page, size },
        })
      ).data.items.map(postFromResponse),
  },

  /**
   * Actions on nodes.
   */
  nodes: {
    /**
     * Fetches a list of all nodes on the server.
     * @returns a list of nodes
     */
    list: async (): Promise<Node[]> => (await axios.get("/nodes")).data,

    /**
     * Creates or updates a node.
     * @param node the node to create or update
     * @returns TODO
     */
    createOrUpdate: async (
      node: Node & { incomingPassword: string }
    ): Promise<unknown> =>
      (await axios.post(`/nodes/${encodeURIComponent(node.serviceUrl)}`, node))
        .data,

    /**
     * Actions on the node with service URL `serviceUrl`.
     */
    withServiceUrl: (serviceUrl: string) => ({
      /**
       * Deletes the node.
       * @returns TODO
       */
      delete: async (): Promise<unknown> =>
        (await axios.delete(`/nodes/${encodeURIComponent(serviceUrl)}`)).data,
    }),
  },

  /**
   * Actions on authors.
   */
  authors: {
    /**
     * Fetches a paginated list of all authors on the server.
     * @param page the page to return
     * @param size the number of authors per page
     * @returns a list of authors
     */
    list: async (
      page?: number,
      size?: number,
      nodeServiceUrl?: string
    ): Promise<Author[]> =>
      (
        await axios.get<{ items: AuthorResponse[] }>("/authors", {
          params: { page, size, node: nodeServiceUrl },
        })
      ).data.items.map(authorFromResponse),

    /**
     * Gets data about the currently logged-in author.
     */
    getCurrent: async (): Promise<Author> =>
      authorFromResponse((await axios.get<AuthorResponse>("/authors/me")).data),

    /**
     * Actions on the author with ID `authorId`.
     */
    withId: (authorId: string, nodeServiceUrl?: string) => ({
      /**
       * Fetches the profile of the author.
       * @returns profile of the author
       */
      get: async (): Promise<Author> =>
        authorFromResponse(
          (
            await axios.get<AuthorResponse>(`/authors/${authorId}`, {
              params: { node: nodeServiceUrl },
            })
          ).data
        ),

      /**
       * Updates the profile of the author.
       * @param author the new profile data of the author
       * @returns TODO
       */
      update: async (author: Author): Promise<unknown> =>
        (
          await axios.post(
            `/authors/${authorId}`,
            authorToRequest(author, baseUrl)
          )
        ).data,

      /**
       * Deletes the author.
       * @returns TODO
       */
      delete: async (): Promise<unknown> =>
        (await axios.delete(`/authors/${authorId}`)).data,

      /**
       * Actions relating to the author's inbox.
       */
      inbox: {
        /**
         * Fetches a paginated list of items in the author's inbox.
         * @param page the page to return
         * @param size the number of authors per page
         * @returns a list of items in the inbox
         */
        list: async (page?: number, size?: number): Promise<InboxItem[]> =>
          (
            await axios.get<{ items: InboxItemResponse[] }>(
              `/authors/${authorId}/inbox`,
              {
                params: { page, size },
              }
            )
          ).data.items.map(inboxItemFromResponse),

        /**
         * Send a follow request to the author's inbox.
         */
        requestToFollow: async (): Promise<void> =>
          (await axios.post(`authors/${authorId}/inbox`, { type: "Follow" }))
            .data,

        /**
         * Clear the author's inbox.
         * @returns TODO
         */
        clear: async (): Promise<unknown> =>
          (await axios.delete(`/authors/${authorId}/inbox`)).data,
      },

      /**
       * Actions relating to the author's likes.
       */
      likes: {
        /**
         * Fetches a list of items the author has liked.
         */
        list: async (): Promise<(Post | Comment)[]> => {
          const items = (
            await axios.get<{
              items: (PostResponse | CommentResponse)[];
            }>(`/authors/${authorId}/likes`, {
              params: { node: nodeServiceUrl },
            })
          ).data.items;
          return items.map((itemData) => {
            if (itemData.type === "post") {
              return postFromResponse(itemData);
            } else if (itemData.type === "comment") {
              return commentFromResponse(itemData);
            }
            throw new Error(`Unknown item type ${(itemData as any)?.type}`);
          });
        },
      },

      /**
       * Actions on the existing or potential followers of this author.
       */
      followers: {
        /**
         * Lists the followers of the author.
         * @returns a list of the profiles of the followers
         */
        list: async (): Promise<Author[]> =>
          (
            await axios.get<{ items: AuthorResponse[] }>(
              `/authors/${authorId}/followers`,
              { params: { node: nodeServiceUrl } }
            )
          ).data.items.map(authorFromResponse),

        /**
         * Actions on the existing or potential follower with ID `followerId` of the author.
         */
        withId: (followerId: string) => ({
          /**
           * Checks if this author is in fact a follower.
           * @returns {'result': true} if this author is a follower, {'result': false} otherwise
           */
          isAFollower: async (): Promise<{ result: boolean }> =>
            (
              await axios.get<{ result: boolean }>(
                `/authors/${authorId}/followers/${followerId}`,
                { params: { node: nodeServiceUrl } }
              )
            ).data,

          /**
           * Makes this author a follower.
           * @returns TODO
           */
          follow: async (): Promise<unknown> =>
            (await axios.put(`/authors/${authorId}/followers/${followerId}`))
              .data,

          /**
           * Makes this author not a follower.
           * @returns TODO
           */
          unfollow: async (): Promise<unknown> =>
            (await axios.delete(`/authors/${authorId}/followers/${followerId}`))
              .data,
        }),
      },

      /**
       * Actions on the authors that this author follows.
       */
      followings: {
        /**
         * Lists the authors that this author follows.
         * @returns a list of the authors that are followed
         */
        list: async (): Promise<Author[]> =>
          (
            await axios.get<{ items: AuthorResponse[] }>(
              `/authors/${authorId}/following`,
              { params: { node: nodeServiceUrl } }
            )
          ).data.items.map(authorFromResponse),
      },

      /**
       * Actions on the posts of this author.
       */
      posts: {
        /**
         * Fetches a paginated list of posts by this author.
         * @param page the page to return
         * @param size the number of posts per page
         * @returns a list of posts
         */
        list: async (page?: number, size?: number): Promise<Post[]> =>
          (
            await axios.get<{ items: PostResponse[] }>(
              `/authors/${authorId}/posts`,
              {
                params: { page, size, node: nodeServiceUrl },
              }
            )
          ).data.items.map(postFromResponse),

        /**
         * Creates a post with a random ID.
         * @param data the data of the post
         * @returns TODO
         */
        create: async (data: FormData): Promise<unknown> =>
          (await axios.post(`/authors/${authorId}/posts`, data)).data,

        /**
         * Actions on the post with ID `postId`.
         */
        withId: (postId: string) => ({
          /**
           * Fetches the post.
           * @returns the post
           */
          get: async (): Promise<Post> =>
            postFromResponse(
              (
                await axios.get<PostResponse>(
                  `/authors/${authorId}/posts/${postId}`,
                  { params: { node: nodeServiceUrl } }
                )
              ).data
            ),

          /**
           * Updates the post with new data.
           * @param data the data to update the post with
           * @returns TODO
           */
          update: async (data: FormData): Promise<unknown> =>
            (await axios.post(`/authors/${authorId}/posts/${postId}`, data))
              .data,

          /**
           * Creates the post.
           * @param data the data of the post
           * @returns TODO
           */
          create: async (data: FormData): Promise<unknown> =>
            (await axios.put(`/authors/${authorId}/posts/${postId}`, data))
              .data,

          /**
           * Deletes the post.
           * @returns TODO
           */
          delete: async (): Promise<unknown> =>
            (await axios.delete(`/authors/${authorId}/posts/${postId}`)).data,

          /**
           * Fetches the image of this post.
           * @returns the image of this post if it exists
           */
          image: async (): Promise<Post> =>
            postFromResponse(
              (
                await axios.get<PostResponse>(
                  `/authors/${authorId}/posts/${postId}/image`,
                  { params: { node: nodeServiceUrl } }
                )
              ).data
            ),

          /**
           * Actions relating to likes on the post.
           */
          likes: {
            /**
             * List the likes on this post.
             * @returns a list of the likes on the post
             */
            list: async (): Promise<Like[]> =>
              (
                await axios.get<{ items: LikeResponse[] }>(
                  `/authors/${authorId}/posts/${postId}/likes`,
                  { params: { node: nodeServiceUrl } }
                )
              ).data.items.map(likeFromResponse),

            /**
             * Like the post.
             * @returns TODO
             */
            like: async (): Promise<unknown> =>
              await axios.post(
                `/authors/${authorId}/inbox`,
                await axios.post(`/authors/${authorId}/inbox`, {
                  type: "Like",
                  object: `${baseUrl}/authors/${authorId}/posts/${postId}`,
                })
              ),
          },

          /**
           * Actions on the comments of this post.
           */
          comments: {
            /**
             * Gets a paginated list of comments on this post.
             * @param page the page number
             * @param size the number of comments per page
             * @returns a list of comments in the page
             */
            list: async (page?: number, size?: number): Promise<Comment[]> =>
              commentsFromResponse(
                (
                  await axios.get<CommentsResponse>(
                    `/authors/${authorId}/posts/${postId}/comments`,
                    { params: { page, size, node: nodeServiceUrl } }
                  )
                ).data
              ),

            /**
             * Creates a comment on the post with a random ID.
             * @param comment the comment data
             * @returns TODO
             */
            create: async (
              comment: Pick<Comment, "comment" | "contentType">
            ): Promise<unknown> =>
              (
                await axios.post(
                  `/authors/${authorId}/posts/${postId}/comments`,
                  commentCreateToRequest(comment, baseUrl)
                )
              ).data,

            /**
             * Actions on the comment with ID `commentId`.
             */
            withId: (commentId: string) => ({
              /**
               * Actions relating to likes on the comment.
               */
              likes: {
                /**
                 * List the likes on this post.
                 * @returns a list of the likes on the post
                 */
                list: async (): Promise<Like[]> =>
                  (
                    await axios.get<{ items: LikeResponse[] }>(
                      `/authors/${authorId}/posts/${postId}/comments/${commentId}/likes`,
                      { params: { node: nodeServiceUrl } }
                    )
                  ).data.items,

                /**
                 * Like the post.
                 * @returns TODO
                 */
                like: async (): Promise<unknown> =>
                  await axios.post(`/authors/${authorId}/inbox`, {
                    type: "Like",
                    object: `${baseUrl}/authors/${authorId}/posts/${postId}/comments/${commentId}`,
                  }),
              },
            }),
          },
        }),
      },
    }),
  },
};

export default api;
