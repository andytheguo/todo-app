import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { Prisma } from "../../generated/prisma/client.js";
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';

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

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ error: "email is required" });
    }

    const user = await prisma.user.findUnique({
      where: {
        email: email
      }
    });

    if (!user || !password) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const valid = await argon2.verify(user.password, password);

    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const secret = process.env.ACCESS_TOKEN_SECRET;

    if (!secret) {
      throw new Error("ACCESS_TOKEN_SECRET is undefined");
    }

    const accessToken = jwt.sign({ userId: user.id }, secret);

    res.status(200).json({ accessToken: accessToken });
  }
  catch (e) {
    res.sendStatus(500);
  }
});

export default router;
