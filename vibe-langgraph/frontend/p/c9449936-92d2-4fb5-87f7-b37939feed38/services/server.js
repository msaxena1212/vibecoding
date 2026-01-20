const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');

const prisma = new PrismaClient();
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Menu Items
app.get('/menu', async (req, res) => {
  try {
    const menuItems = await prisma.menuItem.findMany();
    res.json(menuItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
});

app.post('/menu', async (req, res) => {
  // TODO: Authentication/Authorization
  try {
    const newMenuItem = await prisma.menuItem.create({
      data: req.body,
    });
    res.status(201).json(newMenuItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create menu item' });
  }
});

app.put('/menu/:id', async (req, res) => {
  // TODO: Authentication/Authorization
  const { id } = req.params;
  try {
    const updatedMenuItem = await prisma.menuItem.update({
      where: { id: parseInt(id) },
      data: req.body,
    });
    res.json(updatedMenuItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update menu item' });
  }
});

app.delete('/menu/:id', async (req, res) => {
  // TODO: Authentication/Authorization
  const { id } = req.params;
  try {
    await prisma.menuItem.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
});

// Orders
app.post('/orders', async (req, res) => {
  try {
    const newOrder = await prisma.order.create({
      data: {
        ...req.body,
        orderDate: new Date(),
      },
    });
    res.status(201).json(newOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

app.get('/orders/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: { items: true },
    });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});