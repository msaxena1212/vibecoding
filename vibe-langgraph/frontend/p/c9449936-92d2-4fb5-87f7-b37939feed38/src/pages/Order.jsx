import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';

const mockCartItems = [
  {
    id: '1',
    name: 'Chicken Tikka Masala Roll',
    price: 8.99,
    quantity: 1,
  },
  {
    id: '2',
    name: 'Vegetable Samosa (2 pcs)',
    price: 5.99,
    quantity: 2,
  },
];

export default function Order() {
  const [cartItems, setCartItems] = useState(mockCartItems);
  const [isCartEmpty, setIsCartEmpty] = useState(true);

  useEffect(() => {
    setIsCartEmpty(cartItems.length === 0);
  }, [cartItems]);

  const incrementQuantity = (itemId) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decrementQuantity = (itemId) => {
    setCartItems((prevItems) =>
      prevItems
        .map((item) =>
          item.id === itemId ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item
        )
    );
  };

  const removeItem = (itemId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="container mx-auto py-12 px-4 md:px-6 lg:px-8"
    >
      <h1 className="text-3xl font-bold text-orange-600 mb-6 text-center">Your Order</h1>

      {isCartEmpty ? (
        <div className="text-center text-gray-500">
          <p className="mb-4">Your cart is currently empty.</p>
          <Link to="/menu" className="text-blue-500 hover:underline">
            Browse the menu and add items to your cart!
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Cart Items */}
          <div className="lg:w-2/3">
            <div className="bg-white/70 backdrop-blur-lg rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Order Summary</h2>
              {cartItems.map((item) => (
                <motion.div
                  key={item.id}
                  className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: 0.1 * cartItems.indexOf(item) }}
                >
                  <div className="flex items-center">
                    <span className="mr-4 text-gray-600">{item.name}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center border border-gray-300 rounded-md">
                      <button
                        onClick={() => decrementQuantity(item.id)}
                        className="px-2 py-1 hover:bg-gray-100 focus:outline-none"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="px-3 text-gray-700">{item.quantity}</span>
                      <button
                        onClick={() => incrementQuantity(item.id)}
                        className="px-2 py-1 hover:bg-gray-100 focus:outline-none"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <span className="text-gray-700">${(item.price * item.quantity).toFixed(2)}</span>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700 focus:outline-none"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Order Total and Checkout */}
          <div className="lg:w-1/3">
            <div className="bg-white/70 backdrop-blur-lg rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Order Total</h2>
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600">Subtotal:</span>
                <span className="text-gray-700">${calculateTotal()}</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600">Tax (estimated):</span>
                <span className="text-gray-700">$0.00</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600">Delivery:</span>
                <span className="text-gray-700">$0.00</span>
              </div>
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-700">Total:</span>
                  <span className="text-lg font-bold text-orange-600">${calculateTotal()}</span>
                </div>
                <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-md mt-6 w-full transition-colors duration-200">
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}