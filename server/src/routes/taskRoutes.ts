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

    const last = await prisma.task.findFirst({
      where: {
        projectId: Number(projectId),
        complete: false
      },
      orderBy: {
        order: "desc"
      }
    });

    const order = last ? last.order + 1 : 0;

    const task = await prisma.task.create({
      data: {
        title: title,
        description: description,
        project: {
          connect: {
            id: project.id
          }
        },
        order: order
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
      },
      orderBy: {
        order: "asc"
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

router.patch("/projects/:projectId/tasks/reorder", authenticateToken, async (req, res) => {
  const { projectId } = req.params;
  const { incomplete, complete } = req.body;

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

    if (!Array.isArray(incomplete) || !Array.isArray(complete)) {
      return res.status(400).json({ error: "incomplete and complete must be of type Array"});
    }

    const incompleteUpdates = incomplete.map((taskId, index) => {
      return prisma.task.update({
        where: {
          id: taskId
        },
        data: {
          complete: false,
          order: index
        }
      });
    });

    const completeUpdates = complete.map((taskId, index) => {
      return prisma.task.update({
        where: {
          id: taskId
        },
        data: {
          complete: true,
          order: index
        }
      });
    });

    await prisma.$transaction([...incompleteUpdates, ...completeUpdates]);

    res.sendStatus(204);
  }
  catch (e) {
    return res.status(500).json({ error: "Reorder failed" });
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
