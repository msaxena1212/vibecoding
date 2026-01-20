import { useState, useEffect } from 'react';

const API_BASE_URL = '/api'; // Or your backend URL

// Mock data in case the API fails
const mockMenu = [
  {
    "id": "1",
    "name": "Chicken Tikka Masala Roll",
    "description": "Tender chicken tikka masala wrapped in a warm naan bread with fresh cilantro and mint chutney.",
    "price": 8.99,
    "category": "Rolls",
    "image_url": "https://example.com/tikka_roll.jpg",
    "ingredients": [
      "Chicken",
      "Yogurt",
      "Tomato",
      "Ginger",
      "Garlic",
      "Spices",
      "Naan",
      "Cilantro",
      "Mint",
      "Chutney"
    ],
    "allergens": [
      "Dairy",
      "Gluten"
    ],
    "is_vegetarian": false
  },
  {
    "id": "2",
    "name": "Vegetable Samosa (2 pcs)",
    "description": "Crispy fried pastry filled with spiced potatoes and peas. Served with tamarind chutney.",
    "price": 5.99,
    "category": "Appetizers",
    "image_url": "https://example.com/samosa.jpg",
    "ingredients": [
      "Potatoes",
      "Peas",
      "Spices",
      "Flour",
      "Oil",
      "Tamarind",
      "Sugar"
    ],
    "allergens": [
      "Gluten"
    ],
    "is_vegetarian": true
  },
  {
    "id": "3",
    "name": "Chole Bhature",
    "description": "A classic North Indian dish of spicy chickpeas served with fried bread (bhature).",
    "price": 9.99,
    "category": "Main Courses",
    "image_url": "https://example.com/chole_bhature.jpg",
    "ingredients": [
      "Chickpeas",
      "Onions",
      "Tomatoes",
      "Spices",
      "Flour",
      "Oil"
    ],
    "allergens": [
      "Gluten"
    ],
    "is_vegetarian": true
  },
  {
    "id": "4",
    "name": "Mango Lassi",
    "description": "A refreshing yogurt-based drink with mango pulp.",
    "price": 4.99,
    "category": "Drinks",
    "image_url": "https://example.com/mango_lassi.jpg",
    "ingredients": [
      "Mango",
      "Yogurt",
      "Sugar",
      "Cardamom"
    ],
    "allergens": [
      "Dairy"
    ],
    "is_vegetarian": true
  }
];

// Function to fetch menu items
export const fetchMenuItems = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/menu`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching menu:", error);
    // Return mock data if the API call fails
    return mockMenu;
  }
};

// Function to add an item to the cart (simulated)
export const addToCart = async (itemId, quantity = 1) => {
  try {
    // Simulate adding to cart on the backend
    const response = await fetch(`${API_BASE_URL}/cart/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ itemId, quantity }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data; // Or just return true/false for success
  } catch (error) {
    console.error("Error adding to cart:", error);
    return { success: false, message: "Failed to add to cart." }; // Indicate failure
  }
};

// Function to submit an order (simulated)
export const submitOrder = async (cartItems, customerInfo) => {
  try {
    // Simulate submitting the order to the backend
    const response = await fetch(`${API_BASE_URL}/order/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cartItems, customerInfo }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data; // Return order confirmation or details
  } catch (error) {
    console.error("Error submitting order:", error);
    return { success: false, message: "Failed to submit order." }; // Indicate failure
  }
};