const express = require('express');
const router = express.Router();
const prisma = require('../db/prisma');

router.get('/get-cart', async function (req, res) {
  console.log('User uid: ' + req.session.uid);

  const orders = await prisma.orders.findFirst({
    where: {
      uid: req.session.uid,
      state: 1,
    },
  });

  if (!orders) {
    res.json({     
      products: [],
      cart: {}
    });
  } else {
    const cart = Object.keys(JSON.parse(orders.cart));
    // console.log(cart);

    const products = await prisma.product.findMany({
      where: {
        id: { in: cart.map(item => parseInt(item)) }
      }
    });
    // console.log(products);

    res.json({
      products: products,
      cart: JSON.parse(orders.cart)
    });
  }

});


// //Add goods to cart
// router.post('/add-to-cart', async function (req, res) {
//   console.log('Goods id: ' + req.body.id);
//   console.log('User uid: ' + req.session.uid);

//   let userId = null;

//   if (req.session.uid) {
//     const authKey = await prisma.authKey.findUnique({
//       where: { authkey: req.session.uid },  
//     });

//     if (authKey) { userId = authKey.user_Id;}
//   }

//   const orders = await prisma.orders.findFirst({
//     where: { uid: req.session.uid, state: 1 },
//   });

//   let cart = {};

//   if (!orders) {
//     cart[req.body.id] = 1;
//     const cartSerialized = JSON.stringify(cart);
//     const createdAt = Math.floor(Date.now() / 1000);

//     await prisma.orders.create({
//       data: {
//         uid: req.session.uid,
//         user_id: userId || null, 
//         cart: cartSerialized,
//         created_at: createdAt,
//       },
//     });
//   } else {
//     cart = JSON.parse(orders.cart);

//     if (req.body.id in cart) {
//       cart[req.body.id]++;
//     } else {
//       cart[req.body.id] = 1;
//     }

//     await prisma.orders.update({
//       where: { id: orders.id },
//       data: { cart: JSON.stringify(cart) },
//     });
//   }
//   res.json({ result: true });
// });



router.post('/add-to-cart', async function (req, res) {
  console.log('Goods id: ' + req.body.id);
  console.log('User uid: ' + req.session.uid);

  let userId = null;

  if (req.session.uid) {
    const authKey = await prisma.authKey.findUnique({
      where: { authkey: req.session.uid },  
    });

    if (authKey) {
      userId = authKey.user_Id;
    }
  }

  let order = await prisma.orders.findFirst({
    where: { uid: req.session.uid, state: 1 },
    include: { orderItems: true },
  });

  if (!order) {
    order = await prisma.orders.create({
      data: {
        uid: req.session.uid,
        user_id: userId || null,
        state: 1,
        cart: '{}',
        created_at: Math.floor(Date.now() / 1000),
      },
    });
  }

  let existingOrderItem = await prisma.orderItems.findFirst({
    where: { orderId: order.id, productId: parseInt(req.body.id), },
  });

  if (existingOrderItem) {
    await prisma.orderItems.update({
      where: { id: existingOrderItem.id },
      data: { quantity: existingOrderItem.quantity + 1 },
    });
  } else {

    await prisma.orderItems.create({
      data: {
        orderId: order.id,
        productId: parseInt(req.body.id),
        quantity: 1,
      },
    });
  }

  const updatedOrderItems = await prisma.orderItems.findMany({
    where: { orderId: order.id },
  });

  let newCart = {};
  updatedOrderItems.forEach(item => {
    newCart[item.productId] = item.quantity;
  });

  await prisma.orders.update({
    where: { id: order.id },
    data: { cart: JSON.stringify(newCart) },
  });
  res.json({ result: true, cart: newCart });
});


// router.post('/add-to-cart', async function (req, res) {
//   console.log('Goods id: ' + req.body.id);
//   console.log('User uid: ' + req.session.uid);

//   const orders = await prisma.orders.findFirst({
//     where: { uid: req.session.uid, state: 1, },
//   });

//   const result = orders ? [orders] : [];
//   console.log(result);

//   let cart = {};


//   if (!orders) {
//     cart[req.body.id] = 1;
//     const cartSerialized = JSON.stringify(cart);
//     const createdAt = Math.floor(Date.now() / 1000);

//     await prisma.orders.create({
//       data: { uid: req.session.uid, cart: cartSerialized, created_at: createdAt, },
//     });
//   } else {
//     cart = JSON.parse(orders.cart);

//     if (req.body.id in cart) {
//       cart[req.body.id]++;
//     } else {
//       cart[req.body.id] = 1;
//     }
//     await prisma.orders.update({
//       where: { id: orders.id },
//       data: { cart: JSON.stringify(cart), },
//     });
//   }

//   res.json({ "resault": true });
// });



// router.post('/remove-from-cart', async function (req, res) {
//   const orders = await prisma.orders.findFirst({
//     where: { uid: req.session.uid, state: 1 },
//   });

//   if (orders) {
//     let cart = JSON.parse(orders.cart);

//     if (req.body.id in cart) {
//       delete cart[req.body.id];

//       if (Object.keys(cart).length === 0) {
//         await prisma.orders.delete({ where: { id: orders.id } });
//       } else {
//         await prisma.orders.update({
//           where: { id: orders.id },
//           data: { cart: JSON.stringify(cart) },
//         });
//       }
//     }
//   }

//   res.json({ result: true });
// });

router.post('/remove-from-cart', async function (req, res) {
  const orders = await prisma.orders.findFirst({
    where: { uid: req.session.uid, state: 1 },
  });

  if (orders) {
    let cart = JSON.parse(orders.cart);

    if (req.body.id in cart) {
      await prisma.orderItems.deleteMany({
        where: {
          orderId: orders.id,
          productId: parseInt(req.body.id),
        },
      });

      delete cart[req.body.id];

      if (Object.keys(cart).length === 0) {
        await prisma.orderItems.deleteMany({
          where: { orderId: orders.id },
        });
        await prisma.orders.delete({
          where: { id: orders.id },
        });
      } else {
        await prisma.orders.update({
          where: { id: orders.id },
          data: { cart: JSON.stringify(cart) },
        });
      }
    }
  }
  res.json({ result: true });
});

// router.post('/update-cart', async function (req, res) {
//   const orders = await prisma.orders.findFirst({
//     where: { uid: req.session.uid, state: 1 },
//   });

//   if (orders) {
//     let cart = JSON.parse(orders.cart);

//     if (req.body.id in cart) {
//       if (req.body.quantity > 0) {
//         cart[req.body.id] = req.body.quantity;
//       } else {
//         delete cart[req.body.id];
//       }

//       if (Object.keys(cart).length === 0) {
//         await prisma.orders.delete({ where: { id: orders.id } });
//       } else {
//         await prisma.orders.update({
//           where: { id: orders.id },
//           data: { cart: JSON.stringify(cart) },
//         });
//       }
//     }
//   }

//   res.json({ result: true });
// });



router.post('/update-cart', async function (req, res) {
  const orders = await prisma.orders.findFirst({
    where: { uid: req.session.uid, state: 1 },
  });

  if (orders) {
    let cart = JSON.parse(orders.cart);

    if (req.body.id in cart) {
      const quantity = req.body.quantity;

      if (quantity > 0) {
        await prisma.orderItems.updateMany({
          where: { orderId: orders.id, productId: parseInt(req.body.id),},
          data: { quantity: quantity },
        });

        cart[req.body.id] = quantity;
      } else {
        await prisma.orderItems.deleteMany({
          where: { orderId: orders.id, productId: parseInt(req.body.id),},
        });
        delete cart[req.body.id];
      }

      if (Object.keys(cart).length === 0) {
        await prisma.orders.delete({
          where: { id: orders.id },
        });
      } else {
        await prisma.orders.update({
          where: { id: orders.id },
          data: { cart: JSON.stringify(cart) },
        });
      }
    }
  }
  res.json({ result: true });
});


module.exports = router;






