const express = require('express');
const router = express.Router();
const prisma = require('../db/prisma');

router.get('/', async (req, res) => {
    const orders = await prisma.orders.findFirst({
      where: { uid: req.session.uid, state: 1 },
    });
  
    if (orders) {
      const cart = JSON.parse(orders.cart);
      console.log('Cart:', cart);  
  
      const products = await prisma.product.findMany({
        where: { id: { in: Object.keys(cart).map(Number) } },
      });
  
      console.log('Products:', products);  
  
      res.render('pages/order', { cart, products });
    } else {
      res.render('pages/order', { cart: {}, products: [] });
    }
  });
  

module.exports = router;
