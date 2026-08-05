import express, { type Express, type Request, type Response } from 'express';
import { prisma } from './lib/prisma.js';

const app: Express = express();
const port = 3000;

app.use(express.json());

// Tests
app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

app.get("/test-users", async (req: Request, res: Response) => {
  const users = await prisma.user.findMany();

  res.json(users);
});

app.get("/test-tasks", async (req: Request, res: Response) => {
  const tasks = await prisma.task.findMany();

  res.json(tasks);
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
    return res.status(400).json({ error: "A User ID is required." });
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
});

app.get("/users/:userId/tasks", async (req: Request, res: Response) => {
  const userId = req.params.userId as string;

  if (!userId) {
    return res.status(400).json({ error: "A user ID is required." });
  }

  const tasks = await prisma.task.findMany({
    where: {
      userId: userId
    }
  })

  res.status(200).json(tasks);
});

app.patch("/users/:userId/tasks/:taskId", async (req: Request, res: Response) => {
  const { userId, taskId } = req.params;
  const { complete } = req.body;

  if (!userId || !taskId) {
    return res.status(400).json({ error: "A user ID and taskId is required" });
  }

  const task = await prisma.task.update({
    where: {
      id: Number(taskId),
      userId: userId as string
    },
    data: {
      complete: complete
    }
  });

  res.status(200).json(task);
});

app.delete("/users/:userId/tasks/:taskId", async (req: Request, res: Response) => {
  const { userId, taskId } = req.params;

  if (!userId || !taskId) {
    return res.status(400).json({ error: "A user ID and taskId is required" });
  }

  await prisma.task.delete({
    where: {
      id: Number(taskId),
      userId: userId as string
    }
  });

  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
