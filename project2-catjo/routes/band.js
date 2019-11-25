const {
    Router
} = require('express');
const bandRouter = new Router();
//PARAMETER THAT WILL CHECK IF USER IS LOGGED IN
const routeGuard = require('./../middleware/route-guard');
const User = require('./../models/user');

bandRouter.get('/profile/:band_id', routeGuard, (req, res, next) => {
    const bandId = req.params.band_id;
    User.findById(bandId)
        .then(band => {
            res.render('band/profile', {
                band
            });
        })
        .catch(error => {
            next(error);
        });
});

module.exports = bandRouter;