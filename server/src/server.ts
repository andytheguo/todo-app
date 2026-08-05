import express, { type Express, type Request, type Response } from 'express';
import { prisma } from './lib/prisma.js';

const app: Express = express();
const port = 3000;

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

app.get("/test", async (req: Request, res: Response) => {
  const users = await prisma.user.findMany();

  res.json(users);
});

app.post("/users", async (req: Request, res: Response) => {
  const { name, email } = req.body;

  const user = await prisma.user.create({
    data: {
      name: name,
      email: email
    },
  })

  res.status(201).json(user);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
