const {
    Router
} = require('express');
const authenticationRouter = new Router();
const bycryptjs = require ('bcryptjs');

//PARAMETER THAT WILL CHECK IF USER IS LOGGED IN
const routeGuard = require('./../middleware/route-guard');




//here we will do the login sign up/log in/sign out




module.exports = authenticationRouter;