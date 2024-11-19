// Item prices (in Rupiah)
const prices = {
  'mie-gacoan': 15000,
  'siomay': 12000,
  'es-milo': 8000
};

// Format number to Rupiah
function formatRupiah(number) {
  return 'Rp ' + number.toLocaleString('id-ID');
}

// Calculate total for a single item
function calculateItemTotal(quantity, pricePerItem) {
  return quantity * pricePerItem;
}

// Update display for a single item
function updateItemDisplay(itemElement, quantity) {
  const itemId = itemElement.dataset.id;
  const price = prices[itemId];
  const total = calculateItemTotal(quantity, price);
  
  itemElement.querySelector('.quantity').textContent = quantity;
  itemElement.querySelector('.item-total').textContent = formatRupiah(total);
}

// Calculate and update cart totals
function updateCartTotals() {
  let subtotal = 0;
  
  // Calculate subtotal
  document.querySelectorAll('.food-item').forEach(item => {
      const itemId = item.dataset.id;
      const quantity = parseInt(item.querySelector('.quantity').textContent);
      subtotal += calculateItemTotal(quantity, prices[itemId]);
  });
  
  // Calculate tax and total
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;
  
  // Update display
  document.getElementById('subtotal').textContent = formatRupiah(subtotal);
  document.getElementById('tax').textContent = formatRupiah(tax);
  document.getElementById('total').textContent = formatRupiah(total);
}

// Initialize cart functionality
function initializeCart() {
  document.querySelectorAll('.food-item').forEach(item => {
      const minusBtn = item.querySelector('.minus');
      const plusBtn = item.querySelector('.plus');
      const quantityDisplay = item.querySelector('.quantity');
      
      minusBtn.addEventListener('click', () => {
          let quantity = parseInt(quantityDisplay.textContent);
          if (quantity > 1) {
              quantity--;
              updateItemDisplay(item, quantity);
              updateCartTotals();
          }
      });
      
      plusBtn.addEventListener('click', () => {
          let quantity = parseInt(quantityDisplay.textContent);
          if (quantity < 10) { // Maximum 10 items per food item
              quantity++;
              updateItemDisplay(item, quantity);
              updateCartTotals();
          }
      });
  });
  
  // Initial calculation
  updateCartTotals();
}

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', initializeCart);

// Handle coupon application
document.getElementById('applyCouponButton')?.addEventListener('click', function() {
  const couponInput = document.getElementById('inputCode');
  const couponCode = couponInput.value.trim().toUpperCase();
  
  // Example coupon logic
  if (couponCode === 'FIRST10') {
      const currentTotal = parseInt(document.getElementById('total').textContent.replace(/[^0-9]/g, ''));
      const discount = currentTotal * 0.1; // 10% discount
      const newTotal = currentTotal - discount;
      
      document.getElementById('total').textContent = formatRupiah(newTotal);
      alert('Coupon applied successfully! 10% discount applied.');
  } else {
      alert('Invalid coupon code.');
  }
});