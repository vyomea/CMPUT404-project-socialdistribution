import db from './db';

db.sync(process.env.NODE_ENV === 'test' ? { force: true } : { alter: true });
