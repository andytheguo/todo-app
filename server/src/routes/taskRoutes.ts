import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { Prisma } from '../../generated/prisma/client.js';

import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.post("/users/:userId/tasks", authenticateToken, async (req, res) => {
  const userId = req.userId;
  const { title, description } = req.body;

  if (!req.userId) {
    return res.status(401).json({ error: "Unauthenticated" });
  }

  if (userId !== req.userId) {
    return res.status(403).json({ error: "Unauthorised access" });
  }

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

router.get("/users/:userId/tasks", authenticateToken, async (req, res) => {
  const { userId } = req.params;

  if (!req.userId) {
    return res.status(401).json({ error: "Unauthenticated" });
  }

  if (userId !== req.userId) {
    return res.status(403).json({ error: "Unauthorised access" });
  }

  const tasks = await prisma.task.findMany({
    where: {
      userId: userId
    }
  })

  res.status(200).json(tasks);
});

router.patch("/users/:userId/tasks/:taskId", authenticateToken, async (req, res) => {
  const { userId, taskId } = req.params;
  const { complete } = req.body;

  if (!req.userId) {
    return res.status(401).json({ error: "Unauthenticated" });
  }

  if (userId !== req.userId) {
    return res.status(403).json({ error: "Unauthorised access" });
  }

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

router.delete("/users/:userId/tasks/:taskId", authenticateToken, async (req, res) => {
  const { userId, taskId } = req.params;

  if (!req.userId) {
    return res.status(401).json({ error: "Unauthenticated" });
  }

  if (userId !== req.userId) {
    return res.status(403).json({ error: "Unauthorised access" });
  }

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
