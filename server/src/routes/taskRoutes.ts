import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { Prisma } from '../../generated/prisma/client.js';

import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.post("/user/tasks", authenticateToken, async (req, res) => {
  const { title, description } = req.body;

  if (!req.userId) {
    return res.status(401).json({ error: "Unauthenticated" });
  }

  if (title === "") {
    return res.status(400).json({ error: "Title cannot be empty" });
  }

  try {
    const task = await prisma.task.create({
      data: {
        title: title,
        description: description,
        user: {
          connect: {
            id: req.userId
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

router.get("/user/tasks", authenticateToken, async (req, res) => {
  if (!req.userId) {
    return res.status(401).json({ error: "Unauthenticated" });
  }

  const tasks = await prisma.task.findMany({
    where: {
      userId: req.userId
    }
  })

  res.status(200).json(tasks);
});

router.patch("/user/tasks/:taskId", authenticateToken, async (req, res) => {
  const { taskId } = req.params;
  const { complete } = req.body;

  if (!req.userId) {
    return res.status(401).json({ error: "Unauthenticated" });
  }

  try {
    const task = await prisma.task.update({
      where: {
        id: Number(taskId),
        userId: req.userId
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

router.delete("/user/tasks/:taskId", authenticateToken, async (req, res) => {
  const { taskId } = req.params;

  if (!req.userId) {
    return res.status(401).json({ error: "Unauthenticated" });
  }

  try {
    await prisma.task.delete({
      where: {
        id: Number(taskId),
        userId: req.userId
      }
    });

    res.sendStatus(204);
  }
  catch (e) {
    res.status(404).json({ error: "Task not found" });
  }
});

export default router;
