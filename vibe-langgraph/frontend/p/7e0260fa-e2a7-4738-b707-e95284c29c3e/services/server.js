// services/server.js

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
  // TODO: Authentication
  try {
    const newItem = await prisma.menuItem.create({
      data: req.body,
    });
    res.json(newItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create menu item' });
  }
});

app.put('/menu/:id', async (req, res) => {
  // TODO: Authentication
  const { id } = req.params;
  try {
    const updatedItem = await prisma.menuItem.update({
      where: { id: parseInt(id) },
      data: req.body,
    });
    res.json(updatedItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update menu item' });
  }
});

app.delete('/menu/:id', async (req, res) => {
  // TODO: Authentication
  const { id } = req.params;
  try {
    await prisma.menuItem.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: 'Menu item deleted' });
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
    res.json(newOrder);
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
        include: { orderItems: { include: { menuItem: true } } },
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
