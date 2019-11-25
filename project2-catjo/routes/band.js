const {
    Router
} = require('express');
const bandRouter = new Router();
//PARAMETER THAT WILL CHECK IF USER IS LOGGED IN
const routeGuard = require('./../middleware/route-guard');



//require user model




module.exports = bandRouter;