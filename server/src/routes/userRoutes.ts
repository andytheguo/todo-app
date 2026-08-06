import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { Prisma } from "../../generated/prisma/client.js";
import argon2 from 'argon2';

const router = Router();

router.post("/users", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const hash = await argon2.hash(password);

    const user = await prisma.user.create({
      data: {
        name: name,
        email: email,
        password: hash
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
