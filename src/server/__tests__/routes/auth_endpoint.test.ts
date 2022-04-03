import argon2 from 'argon2';
import request from 'supertest';
import app from '../../src/app';
import Author from '../../src/models/Author';

describe('/login', () => {
  let author: Author;
  const email = 'test@example.com';
  const password = 'password';

  beforeAll(async () => {
    author = await Author.create({
      email,
      passwordHash: await argon2.hash(password),
      displayName: 'Test User',
      verified: true,
    });
  });

  afterAll(async () => {
    await author.destroy();
  });

  it('returns token and author info on valid login', async () => {
    const res = await request(app).post('/login').send({
      email,
      password,
    });
    expect(res.statusCode).toBe(200);
    expect(typeof res.body.token).toBe('string');
    expect(res.body.author?.type).toBe('author');
  });

  it('returns error on invalid password', async () => {
    const res = await request(app).post('/login').send({
      email,
      password: 'incorrectpassword',
    });
    expect(res.statusCode).toBe(401);
    expect(res.headers['www-authenticate']).toBe('Bearer');
    expect(res.body.token).toBe(undefined);
  });

  it('returns error on invalid email', async () => {
    const res = await request(app).post('/login').send({
      email: 'nonexistentuser@email.com',
      password,
    });
    expect(res.statusCode).toBe(401);
    expect(res.headers['www-authenticate']).toBe('Bearer');
    expect(res.body.token).toBe(undefined);
  });

  it('returns error on invalid email and password', async () => {
    const res = await request(app).post('/login').send({
      email: 'nonexistentuser@email.com',
      password: 'incorrectpassword',
    });
    expect(res.statusCode).toBe(401);
    expect(res.headers['www-authenticate']).toBe('Bearer');
    expect(res.body.token).toBe(undefined);
  });
});

describe('/register', () => {
  let existingAuthor: Author;
  const existingAuthorEmail = 'ialreadyexist@example.com';

  beforeAll(async () => {
    existingAuthor = await Author.create({
      email: existingAuthorEmail,
      passwordHash: await argon2.hash('theirpassword'),
      displayName: 'Existing User',
    });
  });

  afterAll(async () => {
    await existingAuthor.destroy();
  });

  it('does not allow author to be created with existing email', async () => {
    const res = await request(app).post('/register').send({
      email: existingAuthorEmail,
      password: 'newpassword',
      displayName: 'MyName',
    });
    expect(res.statusCode).toBe(400);
  });

  it('does not allow author to be created with empty email', async () => {
    const res = await request(app).post('/register').send({
      email: '',
      password: 'newpassword',
      displayName: 'MyName',
    });
    expect(res.statusCode).toBe(400);
  });

  it('does not allow author to be created with empty password', async () => {
    const res = await request(app).post('/register').send({
      email: 'newuser@email.com',
      password: '',
      displayName: 'MyName',
    });
    expect(res.statusCode).toBe(400);
  });

  it('does not allow author to be created with empty display name', async () => {
    const res = await request(app).post('/register').send({
      email: 'newuser@email.com',
      password: 'newpassword',
      displayName: '',
    });
    expect(res.statusCode).toBe(400);
  });

  it('returns token and author after successful registration', async () => {
    const res = await request(app).post('/register').send({
      email: 'newuser@email.com',
      password: 'newpassword',
      displayName: 'MyName',
    });
    expect(res.statusCode).toBe(200);
    expect(typeof res.body.token).toBe('string');
    expect(res.body.author?.type).toBe('author');
  });
});
