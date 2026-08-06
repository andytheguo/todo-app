import express from 'express';
import { prisma } from './lib/prisma.js';

import userRoutes from './routes/userRoutes.js'
import taskRoutes from './routes/taskRoutes.js';

const app = express();
const port = 3000;

app.use(express.json());

// Tests
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get("/test-users", async (req, res) => {
  const users = await prisma.user.findMany();

  res.json(users);
});

app.get("/test-tasks", async (req, res) => {
  const tasks = await prisma.task.findMany();

  res.json(tasks);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

app.use(userRoutes);
app.use(taskRoutes);
