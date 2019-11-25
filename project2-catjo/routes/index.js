'use strict';

const { Router } = require('express');
const router = new Router();

router.get('/', (req, res, next) => {
  res.render('index', { title: 'Music Inn' });
});

router.get('/about', (req, res, next) => {
  res.render('about');
});

module.exports = router;
