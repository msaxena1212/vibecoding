import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();
const port = 8000;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// Shinchan Routes
app.get('/shinchan', async (req, res) => {
  // Placeholder for authentication/authorization
  const shinchanData = await prisma.shinchan.findMany();
  res.json(shinchanData);
});

app.post('/shinchan', async (req, res) => {
  // Placeholder for authentication/authorization
  const newShinchan = await prisma.shinchan.create({ data: req.body });
  res.json(newShinchan);
});

// Doraemon Routes
app.get('/doraemon', async (req, res) => {
  // Placeholder for authentication/authorization
  const doraemonData = await prisma.doraemon.findMany();
  res.json(doraemonData);
});

app.post('/doraemon', async (req, res) => {
  // Placeholder for authentication/authorization
  const newDoraemon = await prisma.doraemon.create({ data: req.body });
  res.json(newDoraemon);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});