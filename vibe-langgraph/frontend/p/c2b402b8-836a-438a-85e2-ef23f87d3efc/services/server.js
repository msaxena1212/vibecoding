import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();
const port = 8000;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// Placeholder: Authentication middleware
const authenticate = (req, res, next) => {
  // TODO: Implement authentication logic
  next();
};

// Placeholder: Authorization middleware
const authorize = (role) => (req, res, next) => {
  // TODO: Implement authorization logic
  next();
};

// Animal Endpoints
app.get('/animals', authenticate, async (req, res) => {
  try {
    const animals = await prisma.animal.findMany();
    res.json(animals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch animals' });
  }
});

app.post('/animals', authenticate, authorize('admin'), async (req, res) => {
  try {
    const animal = await prisma.animal.create({ data: req.body });
    res.json(animal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create animal' });
  }
});

app.get('/animals/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const animal = await prisma.animal.findUnique({ where: { id: parseInt(id) } });
    if (!animal) {
      return res.status(404).json({ error: 'Animal not found' });
    }
    res.json(animal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch animal' });
  }
});

app.put('/animals/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const animal = await prisma.animal.update({ where: { id: parseInt(id) }, data: req.body });
    res.json(animal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update animal' });
  }
});

app.delete('/animals/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.animal.delete({ where: { id: parseInt(id) } });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete animal' });
  }
});

// Enclosure Endpoints
app.get('/enclosures', authenticate, async (req, res) => {
  try {
    const enclosures = await prisma.enclosure.findMany();
    res.json(enclosures);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch enclosures' });
  }
});

app.post('/enclosures', authenticate, authorize('admin'), async (req, res) => {
  try {
    const enclosure = await prisma.enclosure.create({ data: req.body });
    res.json(enclosure);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create enclosure' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
