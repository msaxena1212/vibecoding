document.addEventListener('DOMContentLoaded', () => {
  // Mock API for product data (replace with actual API calls)
  const products = [
    { id: 1, name: 'Apple', price: 1.00, imageUrl: 'assets/apple.png' },
    { id: 2, name: 'Bread', price: 2.50, imageUrl: 'assets/bread.png' },
    { id: 3, name: 'Milk', price: 3.00, imageUrl: 'assets/milk.png' },
    { id: 4, name: 'Eggs', price: 4.00, imageUrl: 'assets/eggs.png' },
    { id: 5, name: 'Cheese', price: 5.00, imageUrl: 'assets/cheese.png' },
    { id: 6, name: 'Yogurt', price: 2.00, imageUrl: 'assets/yogurt.png' },
    { id: 7, name: 'Chicken', price: 7.00, imageUrl: 'assets/chicken.png' },
    { id: 8, name: 'Beef', price: 9.00, imageUrl: 'assets/beef.png' }
  ];

  let cart = [];
  let transactionHistory = [];

  const productList = document.getElementById('product-list');
  const cartItems = document.getElementById('cart-items');
  const totalAmount = document.getElementById('total-amount');
  const searchInput = document.getElementById('search-input');
  const transactionHistoryList = document.getElementById('transaction-history');
  const paymentModal = document.getElementById('payment-modal');
  const paymentForm = document.getElementById('payment-form');
  const paymentMessage = document.getElementById('payment-message');
  const closeModalButton = document.getElementById('close-modal');
  const confirmPaymentButton = document.getElementById('confirm-payment');

  // Function to fetch products (mock API)
  async function fetchProducts() {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(products);
      }, 200); // Simulate network latency
    });
  }

  // Function to display products
  async function displayProducts(searchTerm = '') {
    productList.innerHTML = '';
    const availableProducts = await fetchProducts();
    const filteredProducts = availableProducts.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filteredProducts.forEach(product => {
      const productCard = document.createElement('div');
      productCard.classList.add('product-card', 'bg-white/10', 'backdrop-blur-lg', 'border', 'border-white/20', 'rounded-2xl', 'p-4', 'group', 'hover:scale-105', 'transition-all', 'duration-300', 'ease-out');
      productCard.innerHTML = `
          <img src="${product.imageUrl}" alt="${product.name}" class="object-cover rounded-2xl h-32 w-full mb-2">
          <h3 class="text-lg font-semibold text-gray-200">${product.name}</h3>
          <p class="text-md text-gray-300">$${product.price.toFixed(2)}</p>
          <button class="add-to-cart-btn bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-2" data-id="${product.id}">Add to Cart</button>
      `;
      productList.appendChild(productCard);
    });

    // Attach event listeners to "Add to Cart" buttons
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    addToCartButtons.forEach(button => {
      button.addEventListener('click', addToCart);
    });
  }

  // Function to add item to cart
  async function addToCart(event) {
    const productId = parseInt(event.target.dataset.id);
    const availableProducts = await fetchProducts();
    const product = availableProducts.find(p => p.id === productId);

    if (product) {
      const existingCartItemIndex = cart.findIndex(item => item.id === productId);

      if (existingCartItemIndex > -1) {
        // Item already in cart, increase quantity
        cart[existingCartItemIndex].quantity++;
      } else {
        // Item not in cart, add new item
        cart.push({ ...product, quantity: 1 });
      }
      updateCartDisplay();
      showNotification(`${product.name} added to cart!`, 'success');
    } else {
      showNotification('Product not found.', 'error');
    }
  }

  // Function to update cart display
  function updateCartDisplay() {
    cartItems.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
      const cartItemElement = document.createElement('li');
      cartItemElement.classList.add('cart-item', 'flex', 'items-center', 'justify-between', 'py-2', 'border-b', 'border-gray-700');
      cartItemElement.innerHTML = `
          <div class="flex items-center">
              <img src="${item.imageUrl}" alt="${item.name}" class="w-12 h-12 object-cover rounded-md mr-2">
              <div>
                  <p class="text-gray-200 font-semibold">${item.name}</p>
                  <p class="text-gray-400">$${item.price.toFixed(2)} x ${item.quantity}</p>
              </div>
          </div>
          <div class="flex items-center">
              <button class="decrease-quantity-btn bg-gray-600 hover:bg-gray-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline mr-1" data-id="${item.id}">-</button>
              <span class="text-gray-300">${item.quantity}</span>
              <button class="increase-quantity-btn bg-gray-600 hover:bg-gray-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline ml-1" data-id="${item.id}">+</button>
              <button class="remove-from-cart-btn bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline ml-2" data-id="${item.id}">Remove</button>
          </div>
      `;
      cartItems.appendChild(cartItemElement);
      total += item.price * item.quantity;
    });

    totalAmount.textContent = total.toFixed(2);

    // Attach event listeners to quantity buttons
    const decreaseQuantityButtons = document.querySelectorAll('.decrease-quantity-btn');
    decreaseQuantityButtons.forEach(button => {
      button.addEventListener('click', decreaseQuantity);
    });

    const increaseQuantityButtons = document.querySelectorAll('.increase-quantity-btn');
    increaseQuantityButtons.forEach(button => {
      button.addEventListener('click', increaseQuantity);
    });

    const removeFromCartButtons = document.querySelectorAll('.remove-from-cart-btn');
    removeFromCartButtons.forEach(button => {
      button.addEventListener('click', removeFromCart);
    });
  }

  // Function to decrease item quantity
  function decreaseQuantity(event) {
    const productId = parseInt(event.target.dataset.id);
    const cartItemIndex = cart.findIndex(item => item.id === productId);

    if (cartItemIndex > -1) {
      if (cart[cartItemIndex].quantity > 1) {
        cart[cartItemIndex].quantity--;
      } else {
        cart.splice(cartItemIndex, 1); // Remove if quantity is 1
      }
      updateCartDisplay();
    }
  }

  // Function to increase item quantity
  function increaseQuantity(event) {
    const productId = parseInt(event.target.dataset.id);
    const cartItemIndex = cart.findIndex(item => item.id === productId);

    if (cartItemIndex > -1) {
      cart[cartItemIndex].quantity++;
      updateCartDisplay();
    }
  }

  // Function to remove item from cart
  function removeFromCart(event) {
    const productId = parseInt(event.target.dataset.id);
    const cartItemIndex = cart.findIndex(item => item.id === productId);

    if (cartItemIndex > -1) {
      cart.splice(cartItemIndex, 1);
      updateCartDisplay();
    }
  }

  // Function to process payment (mock)
  async function processPayment(paymentDetails) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const success = Math.random() < 0.8; // Simulate success/failure
        if (success) {
          const transactionId = Math.random().toString(36).substring(2, 15);
          resolve({ transactionId, amount: parseFloat(totalAmount.textContent) });
        } else {
          reject(new Error('Payment failed. Please try again.'));
        }
      }, 1500); // Simulate payment processing time
    });
  }

  // Function to display transaction history
  function displayTransactionHistory() {
    transactionHistoryList.innerHTML = '';
    transactionHistory.forEach(transaction => {
      const transactionElement = document.createElement('li');
      transactionElement.classList.add('transaction-item', 'py-2', 'border-b', 'border-gray-700', 'text-gray-300');
      transactionElement.innerHTML = `
          Transaction ID: ${transaction.transactionId}, Amount: $${transaction.amount.toFixed(2)}, Date: ${transaction.date}
      `;
      transactionHistoryList.appendChild(transactionElement);
    });
  }

  // Function to handle payment submission
  async function handlePayment(event) {
    event.preventDefault();

    const cardNumber = document.getElementById('card-number').value;
    const expiryDate = document.getElementById('expiry-date').value;
    const cvv = document.getElementById('cvv').value;

    // Basic validation
    if (!cardNumber || !expiryDate || !cvv) {
      paymentMessage.textContent = 'Please fill in all payment details.';
      paymentMessage.classList.add('text-red-500');
      return;
    }

    paymentMessage.textContent = 'Processing payment...';
    paymentMessage.classList.remove('text-red-500');
    paymentMessage.classList.add('text-green-500');

    try {
      const paymentResult = await processPayment({ cardNumber, expiryDate, cvv });
      paymentMessage.textContent = `Payment successful! Transaction ID: ${paymentResult.transactionId}`;
      paymentMessage.classList.remove('text-red-500');
      paymentMessage.classList.add('text-green-500');

      // Add transaction to history
      transactionHistory.push({
        transactionId: paymentResult.transactionId,
        amount: paymentResult.amount,
        date: new Date().toLocaleString()
      });

      // Clear the cart
      cart = [];
      updateCartDisplay();
      displayTransactionHistory();

      // Reset the form
      paymentForm.reset();

      // Close the modal after a delay
      setTimeout(() => {
        paymentModal.style.display = 'none';
        paymentMessage.textContent = '';
      }, 2000);


    } catch (error) {
      paymentMessage.textContent = error.message;
      paymentMessage.classList.remove('text-green-500');
      paymentMessage.classList.add('text-red-500');
    }
  }

  // Function to show notification
  function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.classList.add('notification', 'fixed', 'top-4', 'right-4', 'p-4', 'rounded-md', 'shadow-lg', 'z-50');
    notification.textContent = message;

    if (type === 'success') {
      notification.classList.add('bg-green-100', 'text-green-800');
    } else if (type === 'error') {
      notification.classList.add('bg-red-100', 'text-red-800');
    } else {
      notification.classList.add('bg-blue-100', 'text-blue-800');
    }

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  // Event listeners
  searchInput.addEventListener('input', () => {
    displayProducts(searchInput.value);
  });

  // Payment Modal Event Listeners
  document.getElementById('checkout-button').addEventListener('click', () => {
    if (cart.length === 0) {
      showNotification("Your cart is empty!", "error");
      return;
    }
    paymentModal.style.display = 'block';
  });

  closeModalButton.addEventListener('click', () => {
    paymentModal.style.display = 'none';
    paymentMessage.textContent = '';
  });

  paymentForm.addEventListener('submit', handlePayment);

  // Keyboard Shortcuts
  document.addEventListener('keydown', (event) => {
    if (event.key === '/') {
      event.preventDefault(); // Prevent default browser behavior
      searchInput.focus();
    } else if (event.key === 'Escape') {
      paymentModal.style.display = 'none'; // Close payment modal
      searchInput.blur(); // Remove focus from search
    }
  });

  // Initial display
  displayProducts();
  updateCartDisplay();
  displayTransactionHistory();
});