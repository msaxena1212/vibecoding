// src/services/api.js

const API_BASE_URL = '/api'; // Or your actual API endpoint

// Mock data for fallback
const mockMenuItems = [
    {
        "item": "Chicken Tikka Masala Roll",
        "description": "Grilled chicken tikka in a creamy tomato sauce, wrapped in a warm naan.",
        "price": 8.99,
        "category": "Rolls",
        "image": "/images/chicken-tikka-roll.jpg",
        "spicy": "medium",
        "vegetarian": false,
        "vegan": false
    },
    {
        "item": "Vegetable Samosas (2)",
        "description": "Crispy fried pastries filled with spiced potatoes and peas, served with mint chutney.",
        "price": 5.99,
        "category": "Appetizers",
        "image": "/images/vegetable-samosas.jpg",
        "spicy": "mild",
        "vegetarian": true,
        "vegan": true
    },
    {
        "item": "Chole Bhature",
        "description": "Spicy chickpea curry served with fried bread (bhature).",
        "price": 9.99,
        "category": "Main Courses",
        "image": "/images/chole-bhature.jpg",
        "spicy": "hot",
        "vegetarian": true,
        "vegan": false
    },
    {
        "item": "Mango Lassi",
        "description": "Refreshing yogurt-based drink with mango pulp.",
        "price": 4.99,
        "category": "Drinks",
        "image": "/images/mango-lassi.jpg",
        "spicy": "none",
        "vegetarian": true,
        "vegan": false
    }
];

const getMenuItems = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/menu`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching menu items:", error);
        return mockMenuItems; // Return mock data on error
    }
};

const addToCart = async (item) => {
    try {
        const response = await fetch(`${API_BASE_URL}/cart/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(item),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error adding to cart:", error);
        // Consider a more sophisticated fallback, like local storage
        return { success: false, message: "Failed to add to cart." };
    }
};

const placeOrder = async (orderData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/order/place`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error placing order:", error);
        return { success: false, message: "Failed to place order." };
    }
};

export { getMenuItems, addToCart, placeOrder };