import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { Prisma } from "../../generated/prisma/client.js";

const router = Router();

router.post("/users", async (req, res) => {
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

export default router;
