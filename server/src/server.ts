import express, { type Express, type Request, type Response } from 'express';
import { prisma } from './lib/prisma.js';
import { Prisma } from "../generated/prisma/client.js";

const app: Express = express();
const port = 3000;

app.use(express.json());

// Tests
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get("/test-users", async (req, res) => {
  const users = await prisma.user.findMany();

  res.json(users);
});

app.get("/test-tasks", async (req, res) => {
  const tasks = await prisma.task.findMany();

  res.json(tasks);
});

app.post("/users", async (req, res) => {
  const { name, email } = req.body;

  try {
    const user = await prisma.user.create({
      data: {
        name: name,
        email: email
      },
    });

    res.status(201).json(user);
  }
  catch (e) {
    if (e instanceof Prisma.PrismaClientValidationError) {
      return res.status(400).json({ error: "Missing or incorrect field" });
    }

    res.sendStatus(500);
  }
});

app.post("/users/:userId/tasks", async (req, res) => {
  const userId = req.params.userId as string;
  const { title, description } = req.body;

  try {
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
  }
  catch (e) {
    if (e instanceof Prisma.PrismaClientValidationError) {
      return res.status(400).json({ error: "Missing or incorrect field" });
    }

    res.sendStatus(500);
  }
});

app.get("/users/:userId/tasks", async (req, res) => {
  const userId = req.params.userId as string;

  const tasks = await prisma.task.findMany({
    where: {
      userId: userId
    }
  })

  res.status(200).json(tasks);
});

app.patch("/users/:userId/tasks/:taskId", async (req, res) => {
  const { userId, taskId } = req.params;
  const { complete } = req.body;

  try {
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
  }
  catch (e) {
    res.status(404).json({ error: "Task not found" });
  }
});

app.delete("/users/:userId/tasks/:taskId", async (req, res) => {
  const { userId, taskId } = req.params;

  try {
    await prisma.task.delete({
      where: {
        id: Number(taskId),
        userId: userId
      }
    });

    res.sendStatus(204);
  }
  catch (e) {
    res.status(404).json({ error: "Task not found" });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
