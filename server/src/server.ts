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
  });

  res.status(201).json(user);
});

app.post("/users/:userId/tasks", async (req: Request, res: Response) => {
  const userId = req.params.userId as string;
  const { title, description } = req.body;

  if (!userId) {
    res.status(400).json({ error: "A User ID is required." });
  }

  const task = await prisma.task.create({
    data: {
      title: title,
      description: description,
      user: {
        connect: {
          id: userId
        }
      }
    }
  });

  res.status(201).json(task);
})

app.get("/users/:userId/tasks", async (req: Request, res: Response) => {
  const userId = req.params.userId as string;

  if (!userId) {
    res.status(400).json({ error: "A User ID is required." });
  }

  const tasks = await prisma.task.findMany({
    where: {
      userId: userId
    }
  })

  res.status(201).json(tasks);
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
