const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth')
const prisma = require('../db/prisma');


router.get('/',  auth, async (req, res) => {
  try {
        if (!req.session.uid) {
          return res.redirect('/auth'); 
        }
        const authRecord = await prisma.authKey.findUnique({
          where: { authkey: req.session.uid },
        });
        if (!authRecord) {
          return res.redirect('/auth'); 
        }
      const user = await prisma.user.findUnique({
        where: { id: authRecord.user_Id },
        select: { id: true, firstName: true, email: true, phone: true, address: true}
       });

        if (!user) {
          return res.redirect('/auth');
        }

      res.render('pages/account', { user });
  } catch (err) {
      console.error("Помилка при отриманні даних користувача:", err);
      res.status(500).send("Помилка сервера");
  }
});


router.get('/manage', auth, async  (req, res, next) => {
    try {
        if (!req.session.uid) {
          return res.redirect('/auth'); 
        }
        const authRecord = await prisma.authKey.findUnique({
          where: { authkey: req.session.uid },
          select: {authkey: true,  user_Id: true}
        });
        if (!authRecord) {
          return res.redirect('/auth'); 
        }
      const user = await prisma.user.findUnique ({
        where: { id: authRecord.user_Id },
        select: { id: true, firstName: true, password: true, email: true, phone: true, address: true}
       });

        if (!user) {
          return res.redirect('/auth');
        }

      res.render('pages/account-manage', { user, authRecord });
  } catch (err) {
      console.error("Помилка при отриманні даних користувача:", err);
      res.status(500).send("Помилка сервера");
  }
});

router.post('/update-profile', async (req, res) => {
  try {
      const { firstName, email, phone, password, address } = req.body;

      if (!req.session.uid) {
          console.log('Не знайдено authkey у сесії');
          return res.status(400).json({ error: 'Користувач не авторизований' });
      }

      const authkey = req.session.uid;

      const authRecord = await prisma.authKey.findUnique({
          where: { authkey: authkey },
      });

      if (!authRecord) {
          console.log('Не знайдений authkey в базі даних');
          return res.status(404).json({ error: 'Користувач не знайдений' });
      }

      const userId = authRecord.user_Id;

      if (!userId) {
          return res.status(404).json({ error: 'Користувач не знайдений' });
      }

      const updatedProfile = await prisma.user.update({
          where: { id: userId },
          data: { firstName, email, phone, password, address },
      });

      res.json({ message: 'Профіль успішно оновлений!' });

  } catch (error) {
      console.error("Ошибка при обновлении профиля:", error);
      res.status(500).json({ error: 'Внутрішня помилка сервера' });
  }
});



router.delete('/delete-profile-db', async (req, res) => {
  try {
    if (!req.session.uid) {
      console.log('Не знайдено authkey у сесії');
      return res.status(400).json({ error: 'Користувач не авторизований' });
    }
    const authkey = req.session.uid;

    const authRecord = await prisma.authKey.findUnique({
      where: { authkey: authkey },
    });

    if (!authRecord) {
      console.log('Не знайдений authkey в базі даних');
      return res.status(404).json({ error: 'Користувач не знайдений' });
    }

    const userId = authRecord.user_Id;

    await prisma.authKey.deleteMany({
      where: { user_Id: userId },
    });
    await prisma.orders.deleteMany({
      where: { user_id: userId }
    });
    await prisma.user.delete({
      where: { id: userId }
    });
    req.session.destroy((err) => {
      if (err) {
        console.log('Помилка при завершенні сесії');
        return res.status(500).json({ error: 'Не вдалося завершити сесію' });
      }
      console.log('Профіль успішно видалений');
      return res.json({ message: 'Профіль успішно видалений' });
    });

  } catch (err) {
    console.error('Помилка при видаленні профілю:', err);
    return res.status(500).json({ error: 'Внутрішня помилка сервера' });
  }
});


module.exports = router;