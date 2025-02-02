import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';

import db from './db';
db.sync({ alter: true });

import { authenticate } from './middlewares/auth.middlewares';
import { paginate } from './middlewares/pagination.middlewares';

import auth from './routes/auth.routes';
import authors from './routes/author.routes';
import nodes from './routes/node.routes';

import { getAllPublicPosts } from './controllers/post.controllers';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

const app = express();
const PORT = process.env.API_PORT || process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(authenticate);
app.use(auth);
app.use('/authors', authors);
app.use('/nodes', nodes);
app.use('/posts', paginate, getAllPublicPosts);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../build')));
  app.get('/*', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../../build', 'index.html'));
  });
}

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log('Your app is listening on port ' + PORT);
  });
}

export default app;
