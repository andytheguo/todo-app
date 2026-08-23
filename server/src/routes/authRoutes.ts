import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import jwt from 'jsonwebtoken';
import { genAccessToken } from '../lib/jwtUtils.js';

const router = Router();

router.post("/token", async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ error: "No refresh token" });
  }

  const token = await prisma.refreshToken.findUnique({
    where: {
      token: refreshToken
    }
  });

  if (!token) {
    return res.status(403).json({ error: "Invalid or expired refresh token" });
  }

  try {
    const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!) as { userId: string };
    const accessToken = genAccessToken(payload.userId);

    res.json({ accessToken: accessToken });
  }
  catch (e) {
    res.status(403).json({ error: "Refresh token has expired" });
  }
});

router.delete("/logout", async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ error: "No refresh token" });
  }

  try {
    await prisma.refreshToken.delete({
      where: {
        token: refreshToken
      }
    });

    res.sendStatus(204);
  }
  catch (e) {
    res.status(403).json({ error: "Invalid refresh token" });
  }
});

export default router;
