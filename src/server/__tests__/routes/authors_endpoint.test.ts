import request from 'supertest';
import { v4 } from 'uuid';
import app from '../../src/app';
import Author from '../../src/models/Author';

describe('Authors', () => {
  let author: Author;

  beforeAll(
    async () =>
      (author = await Author.create({
        id: v4(),
        email: 'test@example.com',
        passwordHash: 'some_hash',
        displayName: 'Test User',
      }))
  );

  afterAll(async () => await author.destroy());

  it('should return all authors', async () => {
    const res = await request(app).get('/authors?page=1&size=5');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('type', 'authors');
    expect(res.body).toHaveProperty('items');
    expect(res.body.items.length).toBeGreaterThan(0);
  });

  it('should return a single author', async () => {
    const res = await request(app).get(`/authors/${author.id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('type', 'author');
    expect(res.body).toHaveProperty('displayName', 'Test User');
  });

  it('should update an author', async () => {
    const res = await request(app)
      .post(`/authors/${author.id}`)
      .send({ displayName: 'Test User Changed' });
    expect(res.statusCode).toBe(200);
    await author.reload();
    expect(author.displayName).toBe('Test User Changed');
  });

  it('should not delete an author because not an admin', async () => {
    const res = await request(app).delete(`/authors/${author.id}`);
    expect(res.statusCode).toBe(401);
  });
});
