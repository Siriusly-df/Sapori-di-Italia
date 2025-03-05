const express = require('express');
const router = express.Router();
const prisma = require('../db/prisma');
require('dotenv').config();

router.get('/', async (req, res) => {
    res.render('pages/authentication')
});

router.get('/register', async (req, res) => {
    res.render('pages/registration')
});

router.get('/logout', async (req, res) => {
    req.session.destroy(() => {
      res.redirect('/cat');
    })
});

router.post('/login', async (req, res) => {
  console.log("Дані з форми:", req.body);
  try {
      const { email, password } = req.body;

      const candidate = await prisma.user.findUnique({
          where: { email: email },
      });

      if (candidate) {
          const areSame = password == candidate.password;

          if (areSame) {
              const threshold = new Date(Date.now() -  1 * 60 * 60 * 1000); 

              await prisma.authKey.deleteMany({
                  where: {
                      createdAt: {
                          lt: threshold, 
                      }
                  }
              });

              const authKey = await prisma.authKey.create({
                  data: { user_Id: candidate.id },
              });

              console.log('Новий authKey:', authKey);

              req.session.uid = authKey.authkey;
              req.session.isAuthenticated = true;

              if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
                  req.session.isAdmin = true;
              }

              req.session.save(err => {
                  if (err) {
                      console.error('Помилка під час збереження сесії:', err);
                      throw err;
                  }
                  res.redirect('/cat');
              });
          } else {
              res.redirect('/auth');
          }
      } else {
          res.redirect('/auth');
      }
  } catch (err) {
      console.error('Помилка під час логіна:', err);
      res.status(500).send('Помилка під час логіна');
  }
});

router.post('/register', async (req, res) => {
    try {
      const { firstName, email, phone, password, address } = req.body;
      
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });
      
      if (existingUser) {
        return res.redirect('/auth/register');
      }

      const newUser = await prisma.user.create({
        data: { firstName, email, phone, password, address},
      });

      req.session.authKey = { userId: newUser.id, };
 
      res.redirect('/cat');
    } catch (e) {
      console.log(e);
      res.status(500).send('Помилка');
    }
 });


module.exports = router;