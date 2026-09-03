import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { Prisma } from "../../generated/prisma/client.js";

import { authenticateToken } from "../middleware/auth.js";

const router = Router();

router.post("/projects/:projectId/tasks", authenticateToken, async (req, res) => {
  const { projectId } = req.params;
  const { title, description } = req.body;

  if (!req.userId) {
    return res.status(401).json({ error: "Unauthenticated" });
  }

  if (title === "") {
    return res.status(400).json({ error: "Title cannot be empty" });
  }

  try {
    const project = await prisma.project.findUnique({
      where: {
        id: Number(projectId),
        userId: req.userId
      }
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const task = await prisma.task.create({
      data: {
        title: title,
        description: description,
        project: {
          connect: {
            id: project.id
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

router.get("/projects/:projectId/tasks", authenticateToken, async (req, res) => {
  const { projectId } = req.params;

  if (!req.userId) {
    return res.status(401).json({ error: "Unauthenticated" });
  }

  try {
    const project = await prisma.project.findUnique({
      where: {
        id: Number(projectId),
        userId: req.userId
      }
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const tasks = await prisma.task.findMany({
      where: {
        projectId: project.id,
        project: {
          userId: req.userId
        }
      }
    });

    res.status(200).json(tasks);
  }
  catch (e) {
    if (e instanceof Prisma.PrismaClientValidationError) {
      return res.status(400).json({ error: "Missing or incorrect field" });
    }

    res.sendStatus(500);
  }
});

router.patch("/tasks/:taskId", authenticateToken, async (req, res) => {
  const { taskId } = req.params;
  const { title, description, complete } = req.body;

  if (title === "") {
    return res.status(400).json({ error: "Title cannot be empty" });
  }

  if (!req.userId) {
    return res.status(401).json({ error: "Unauthenticated" });
  }

  try {
    const task = await prisma.task.update({
      where: {
        id: Number(taskId),
        project: {
          userId: req.userId
        }
      },
      data: {
        title: title,
        description: description,
        complete: complete
      }
    });

    res.status(200).json(task);
  }
  catch (e) {
    res.status(404).json({ error: "Task not found" });
  }
});

router.delete("/tasks/:taskId", authenticateToken, async (req, res) => {
  const { taskId } = req.params;

  if (!req.userId) {
    return res.status(401).json({ error: "Unauthenticated" });
  }

  try {
    await prisma.task.delete({
      where: {
        id: Number(taskId),
        project: {
          userId: req.userId
        }
      }
    });

    res.sendStatus(204);
  }
  catch (e) {
    res.status(404).json({ error: "Task not found" });
  }
});

export default router;
