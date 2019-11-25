const {
    Router
} = require("express");
const bandRouter = new Router();
const bcryptjs = require("bcryptjs");
const routeGuard = require("./../middleware/route-guard");
const User = require("./../models/user");
//Going to the band profile (all users have access if they are logged in)
bandRouter.get("/profile/:band_id", routeGuard, (req, res, next) => {
    const bandId = req.params.band_id;
    User.findById(bandId)
        .then(band => {
            res.render("band/profile", {
                band
            });
        })
        .catch(error => {
            next(error);
        });
});
//Going to the band edit profile (only the the band that is logged in can access its own profile editor)
bandRouter.get("/edit/:band_id", routeGuard, (req, res, next) => {
    const bandId = req.params.band_id;
    if (JSON.stringify(bandId) === JSON.stringify(req.user._id) || req.user.role === 'admin') {
        User.findById(bandId)
            .then(band => {
                res.render("band/edit", {
                    band
                });
            })
            .catch(error => {
                next(error);
            });
    } else {
        res.redirect(`/band/profile/${bandId}`);
    }
});
//Going to the band edit profile (only the the band that is logged in can access its own profile editor)
bandRouter.post("/edit/:band_id", routeGuard, (req, res, next) => {
    const bandId = req.params.band_id;
    const {
        artistName,
        username,
        email,
        password,
        description,
        genres,
        artistAlbums
    } = req.body;
    console.log('THIS IS ROLE OF SESSION', req.user.role);
    if (JSON.stringify(bandId) === JSON.stringify(req.user._id) || req.user.role === 'admin') {
        bcryptjs.hash(password, 10).then(hash => {
            return User.findOneAndUpdate({
                    _id: bandId
                }, {
                    username: username,
                    email: email,
                    description: description,
                    genres: genres,
                    artistAlbums: artistAlbums,
                    artistName: artistName,
                    password: hash
                })
                .then(band => {
                    console.log("The band was edited", band);
                    res.redirect(`/band/profile/${bandId}`);
                })
                .catch(error => {
                    console.log("The band was not edited");
                    next(error);
                });
        });
    } else {
        console.log('NOT POSSIBLE TO EDIT', req.user.role);
        res.redirect(`/band/profile/${bandId}`);
    }
});

bandRouter.get("/list", routeGuard, (req, res, next) => {
    User.find({
            role: "artist"
        })
        .then(bands => {
            res.render("band/list", {
                bands
            });
        })
        .catch(err => {
            next(err);
        });
});
bandRouter.post("/delete/:band_id", routeGuard, (req, res, next) => {
    const bandId = req.params.band_id;
    if (JSON.stringify(bandId) === JSON.stringify(req.user._id) || req.user.role === 'admin') {
        User.findByIdAndDelete({
                _id: bandId
            })
            .then(() => {
                res.redirect("/");
            })
            .catch(err => {
                console.log("couldnt delete band");
                next(err);
            });
    } else {
        res.redirect(`/band/profile/${bandId}`);
    }
});

bandRouter.get("/event/list", routeGuard, (req, res, next) => {
    res.render('band/events/event-list');
});

bandRouter.get("/event/:band_id/add-event", routeGuard, (req, res, next) => {
    res.render('band/events/add-event');
});

bandRouter.get("/event/:band_id", routeGuard, (req, res, next) => {
    res.render('band/events/event-single-band');
});





module.exports = bandRouter;