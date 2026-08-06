import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { Prisma } from "../../generated/prisma/client.js";

const router = Router();

router.post("/users/:userId/tasks", async (req, res) => {
  const userId = req.params.userId;
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

router.get("/users/:userId/tasks", async (req, res) => {
  const userId = req.params.userId;

  const tasks = await prisma.task.findMany({
    where: {
      userId: userId
    }
  })

  res.status(200).json(tasks);
});

router.patch("/users/:userId/tasks/:taskId", async (req, res) => {
  const { userId, taskId } = req.params;
  const { complete } = req.body;

  try {
    const task = await prisma.task.update({
      where: {
        id: Number(taskId),
        userId: userId
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

router.delete("/users/:userId/tasks/:taskId", async (req, res) => {
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

export default router;
