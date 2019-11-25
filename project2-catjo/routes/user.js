'use strict';

const {
  Router
} = require('express');
const router = new Router();

router.get('/', (req, res, next) => {
  res.render('user', {
    name: 'James Dean'
  });
});

//PARAMETER THAT WILL CHECK IF USER IS LOGGED IN
const routeGuard = require('./../middleware/route-guard');



//require user model


module.exports = router;