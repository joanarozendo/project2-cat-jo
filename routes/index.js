'use strict';
const User = require("./../models/user");
const {
  Router
} = require('express');
const router = new Router();

router.get('/', (req, res, next) => {
  res.render('index', {
    title: 'Jam Up'
  });
});

router.get('/about', (req, res, next) => {
  res.render('about');
});

router.get('/dashboard', (req, res, next) => {
  const userId = req.user._id;
  console.log(req.user);
  User.findById(userId)
    .populate('images')
    .then(user => {
      res.render('dashboard', {
        user
      });
    })
    .catch(err => {
      next(err)
    });
});

module.exports = router;