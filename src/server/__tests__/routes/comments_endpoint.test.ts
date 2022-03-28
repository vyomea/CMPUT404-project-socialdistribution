import request from 'supertest';
import { v4 } from 'uuid';
import app from '../../src/app';
import Author from '../../src/models/Author';
import Post from '../../src/models/Post';
import Comment from '../../src/models/Comment';

describe('Comments', () => {
  let author: Author;
  let post: Post;
  let comment: Comment;

  beforeAll(async () => {
    author = await Author.create({
      id: v4(),
      email: 'test@example.com',
      passwordHash: 'some_hash',
      displayName: 'Test User',
    });
    post = await Post.create({
      title: 'Test Post',
      description: 'Test Description',
      source: 'http://test-source.com',
      origin: 'http://test-origin.com',
      content: 'Test',
      categories: [],
      comments: [],
    });
    comment = await Comment.create({
        comment: 'Test Comment',
        contentType: 'text/plain'
    });
    await author.addPost(post);
    await post.addComment(comment);
    await author.addComment(comment);
  });

  afterAll(async () => {
    await comment.destroy();
    await post.destroy();
    await author.destroy();
    
  });

  it('should require pagination', async () => {
    const res = await request(app).get(`/authors/${author.id}/posts/${post.id}/comments`);
    expect(res.statusCode).toBe(400);
    expect(res.body).toMatchObject({
      error: 'This request must be paginated using the parameter page and size',
    });
  });

  it("should return all posts's comments", async () => {
    const res = await request(app).get(
      `/authors/${author.id}/posts/${post.id}/comments?page=1&size=5`
    );
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('type', 'comments');
    expect(res.body).toHaveProperty('comments');
    expect(res.body.comments.length).toBeGreaterThan(0);
  });

  it("should not update an posts's comment because unauthenticated", async () => {
    const res = await request(app)
      .post(`/authors/${author.id}/posts/${post.id}/comments`)
      .send({ title: 'Test Post Changed' });
    expect(res.statusCode).toBe(401);
  });
});
