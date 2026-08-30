import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { Prisma } from '../../generated/prisma/client.js';

import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.post("/projects", authenticateToken, async (req, res) => {
  const { name, description } = req.body;

  if (!req.userId) {
    return res.status(401).json({ error: "Unauthenticated" });
  }

  if (name === "") {
    return res.status(400).json({ error: "Name cannot be empty" });
  }

  try {
    const project = await prisma.project.create({
      data: {
        name: name,
        description: description,
        user: {
          connect: {
            id: req.userId
          }
        }
      }
    });

    res.status(201).json(project);
  }
  catch (e) {
    if (e instanceof Prisma.PrismaClientValidationError) {
      return res.status(400).json({ error: "Missing or incorrect field" });
    }

    res.sendStatus(500);
  }
});

router.get("/projects/", authenticateToken, async (req, res) => {
  const { name, description } = req.body;

  if (!req.userId) {
    return res.status(401).json({ error: "Unauthenticated" });
  }

  if (name === "") {
    return res.status(400).json({ error: "Name cannot be empty" });
  }

  try {
    const project = await prisma.project.create({
      data: {
        name: name,
        description: description,
        user: {
          connect: {
            id: req.userId
          }
        }
      }
    });

    res.status(201).json(project);
  }
  catch (e) {
    if (e instanceof Prisma.PrismaClientValidationError) {
      return res.status(400).json({ error: "Missing or incorrect field" });
    }

    res.sendStatus(500);
  }
});

router.patch("/projects/:projectId", authenticateToken, async (req, res) => {
  const { projectId } = req.params;
  const { name, description } = req.body;

  if (name === "") {
    return res.status(400).json({ error: "Title cannot be empty" });
  }

  if (!req.userId) {
    return res.status(401).json({ error: "Unauthenticated" });
  }

  try {
    const project = await prisma.project.update({
      where: {
        id: Number(projectId),
        userId: req.userId
      },
      data: {
        name: name,
        description: description
      }
    });

    res.status(200).json(project);
  }
  catch (e) {
    res.status(404).json({ error: "Project not found" });
  }
});

router.delete("/projects/:projectId", authenticateToken, async (req, res) => {
  const { projectId } = req.params;

  if (!req.userId) {
    return res.status(401).json({ error: "Unauthenticated" });
  }

  try {
    await prisma.project.delete({
      where: {
        id: Number(projectId),
        userId: req.userId
      }
    });

    res.sendStatus(204);
  }
  catch (e) {
    res.status(404).json({ error: "Project not found" });
  }
});

export default router;
