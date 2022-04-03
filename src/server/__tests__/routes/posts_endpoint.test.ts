import request from 'supertest';
import { v4 } from 'uuid';
import app from '../../src/app';
import Author from '../../src/models/Author';
import Post from '../../src/models/Post';

describe('Posts', () => {
  let author: Author;
  let post: Post;

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
    });
    await author.addPost(post);
  });

  afterAll(async () => {
    await post.destroy();
    await author.destroy();
  });

  it("should return all author's posts", async () => {
    const res = await request(app).get(
      `/authors/${author.id}/posts?page=1&size=5`
    );
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('type', 'posts');
    expect(res.body).toHaveProperty('items');
    expect(res.body.items.length).toBeGreaterThan(0);
  });

  it("should return a single author's post", async () => {
    const res = await request(app).get(
      `/authors/${author.id}/posts/${post.id}`
    );
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('type', 'post');
    expect(res.body).toHaveProperty('title', 'Test Post');
  });

  it("should not update an author's post because unauthenticated", async () => {
    const res = await request(app)
      .post(`/authors/${author.id}/posts/${post.id}`)
      .send({ title: 'Test Post Changed' });
    expect(res.statusCode).toBe(401);
  });

  it("should not delete an author's post because unauthenticated", async () => {
    const res = await request(app).delete(
      `/authors/${author.id}/posts/${post.id}`
    );
    expect(res.statusCode).toBe(401);
  });
});
