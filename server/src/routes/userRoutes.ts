import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { Prisma } from "../../generated/prisma/client.js";
import argon2 from 'argon2';
import { genAccessToken, genRefreshToken } from '../lib/jwtUtils.js';

const router = Router();

router.post("/register", async (req, res) => {
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
    console.error(e);
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

    const accessToken = genAccessToken(user.id);
    const refreshToken = genRefreshToken(user.id);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        user: {
          connect: {
            id: user.id
          }
        }
      }
    });

    res.status(200).json({ accessToken: accessToken, refreshToken: refreshToken });
  }
  catch (e) {
    res.sendStatus(500);
  }
});

export default router;
