import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';

import db from './db';
db.sync({ alter: true });

import { authenticate } from './middlewares/auth.middlewares';

import auth from './routes/auth.routes';
import authors from './routes/author.routes';
import nodes from './routes/node.routes';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

const app = express();
const PORT = process.env.PORT || process.env.API_PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(authenticate);
app.use(auth);
app.use('/authors', authors);
app.use('/nodes', nodes);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../build')));
}

app.all('*', (req: Request, res: Response) => {
  res.status(404).send();
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log('Your app is listening on port ' + PORT);
  });
}

export default app;
