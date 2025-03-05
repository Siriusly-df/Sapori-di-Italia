const openCartBtn = document.getElementById('open-cart');
const closeCartBtn = document.getElementById('close-cart');
const cartOverlay = document.getElementById('cart-overlay');
const backButton = document.getElementById('back-button');


openCartBtn.addEventListener('click', () => {
    cartOverlay.style.display = 'flex'; 
  });
  
  closeCartBtn.addEventListener('click', () => {
    cartOverlay.style.display = 'none'; 
  });

  cartOverlay.addEventListener('click', (e) => {
    if (e.target === cartOverlay) {
      cartOverlay.style.display = 'none';
    }
  });
  