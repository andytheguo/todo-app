import express, { type Express, type Request, type Response } from 'express';
import { prisma } from './lib/prisma.js';

const app: Express = express();
const port = 3000;

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

app.get("/test", async (req: Request, res: Response) => {
  const users = await prisma.user.findMany();

  res.json(users);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
