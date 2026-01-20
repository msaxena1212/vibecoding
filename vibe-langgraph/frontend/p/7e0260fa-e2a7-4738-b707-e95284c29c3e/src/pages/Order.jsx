import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, XCircle } from 'lucide-react';
import clsx from 'clsx';

export default function OrderPage() {
  const [cart, setCart] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentInfo, setPaymentInfo] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(false);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await fetch('/api/menu');
        const data = await response.json();
        setMenuItems(data);
      } catch (error) {
        console.error('Error fetching menu:', error);
        // Mock data fallback
        setMenuItems([
          { id: 1, item: "Chicken Tikka Masala Roll", price: 8.99 },
          { id: 2, item: "Vegetable Samosas (2)", price: 5.99 },
        ]);
      }
    };

    fetchMenu();
  }, []);

  const addToCart = (item) => {
    const existingItem = cart.find((cartItem) => cartItem.id === item.id);
    if (existingItem) {
      setCart(
        cart.map((cartItem) =>
          cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
        )
      );
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter((item) => item.id !== itemId));
  };

  const increaseQuantity = (itemId) => {
    setCart(
      cart.map((item) =>
        item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQuantity = (itemId) => {
    setCart(
      cart.map((item) =>
        item.id === itemId && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item
      )
    );
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
  };

  const handlePlaceOrder = async () => {
    try {
      // Simulate order placement
      console.log('Order placed:', {
        cart,
        deliveryAddress,
        paymentInfo,
        total: calculateTotal(),
      });
      setOrderPlaced(true);
      setCart([]); // Clear the cart after successful order placement
      setDeliveryAddress('');
      setPaymentInfo('');
    } catch (error) {
      console.error('Error placing order:', error);
      // Handle error (e.g., display an error message)
    }
  };

  if (orderPlaced) {
    return (
      <motion.div
        className="container mx-auto py-8 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-green-600 mb-4">Thank you for your order!</h1>
        <p className="text-gray-700 text-lg">
          Your order has been placed successfully. You will receive a confirmation email shortly.
        </p>
        <Link to="/" className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded mt-4 inline-block">
          Back to Home
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="container mx-auto py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-bold text-orange-600 mb-4">Your Order</h1>

      {/* Cart Items */}
      {cart.length > 0 ? (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Cart Items</h2>
          <ul>
            {cart.map((item) => (
              <motion.li
                key={item.id}
                className="flex items-center justify-between py-2 border-b border-gray-200"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <div>
                  <span className="font-semibold">{item.item}</span>
                  <span className="text-gray-600 ml-2">(${item.price.toFixed(2)})</span>
                </div>
                <div className="flex items-center">
                  <button
                    onClick={() => decreaseQuantity(item.id)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-1 px-2 rounded-l active:scale-95"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="mx-2">{item.quantity}</span>
                  <button
                    onClick={() => increaseQuantity(item.id)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-1 px-2 rounded-r active:scale-95"
                  >
                    <Plus size={16} />
                  </button>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="ml-4 text-red-600 hover:text-red-800 active:scale-95"
                  >
                    <XCircle size={20} />
                  </button>
                </div>
              </motion.li>
            ))}
          </ul>
          <div className="mt-4 text-right">
            <span className="font-semibold">Total:</span> ${calculateTotal()}
          </div>
        </div>
      ) : (
        <div className="text-gray-600">Your cart is empty.</div>
      )}

      {/* Delivery Address Form */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Delivery Address</h2>
        <textarea
          className="w-full px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring focus:ring-orange-200"
          rows="3"
          placeholder="Enter your delivery address"
          value={deliveryAddress}
          onChange={(e) => setDeliveryAddress(e.target.value)}
        ></textarea>
      </div>

      {/* Payment Information Form */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Payment Information</h2>
        <input
          type="text"
          className="w-full px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring focus:ring-orange-200"
          placeholder="Enter your credit card number"
          value={paymentInfo}
          onChange={(e) => setPaymentInfo(e.target.value)}
        />
      </div>

      {/* Place Order Button */}
      <motion.button
        className={clsx(
          "bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded active:scale-95",
          { "opacity-50 cursor-not-allowed": cart.length === 0 }
        )}
        onClick={handlePlaceOrder}
        disabled={cart.length === 0}
        whileHover={{ scale: cart.length > 0 ? 1.05 : 1 }}
        whileTap={{ scale: cart.length > 0 ? 0.95 : 1 }}
      >
        Place Order
      </motion.button>
    </motion.div>
  );
}