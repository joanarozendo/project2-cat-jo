const {
    Router
} = require("express");
const eventRouter = new Router();
const routeGuard = require("./../middleware/route-guard");
const User = require("./../models/user");
const Event = require("./../models/events");



//To get API of events' list through axios.
eventRouter.get('/data', (req, res, next) => {
    let date = new Date();
    console.log('todays date', date);
    Event.find()
        .then(events => {
            res.send({
                events
            });
        })
        .catch(err => {
            next(err);
        });
});

//Button attend events
eventRouter.post('/attend/:event_id', routeGuard, (req, res, next) => {

    const eventId = req.params.event_id;
    const userId = req.user._id;

    Event.findByIdAndUpdate(eventId, {
            $push: {
                attend_users_id: userId
            }

        })
        .then(() => {
            return Event.findById(eventId)
                .then(event => {
                    const attendingNumber = event.attend_users_id.length;
                    return Event.findByIdAndUpdate(eventId, {
                        number_of_attendants: attendingNumber
                    }).then(() => {
                        console.log('third promise', event);
                        res.redirect(`/events/profile/${eventId}`);
                    })
                })
        })
        .catch(err => {
            console.log('not possible to attend event');
            next(err);
        });
});

//Button don't attend events
eventRouter.post('/not-attend/:event_id', routeGuard, (req, res, next) => {

    const eventId = req.params.event_id;
    const userId = req.user._id;


    Event.findByIdAndUpdate(eventId, {
            $pull: {
                attend_users_id: userId
            }
        })
        .then(() => {
            return Event.findById(eventId)
                .then(event => {
                    const attendingNumber = event.attend_users_id.length;
                    return Event.findByIdAndUpdate(eventId, {
                        number_of_attendants: attendingNumber
                    }).then(() => {
                        console.log('third promise', event);
                        res.redirect(`/events/profile/${eventId}`);
                    })
                })
        })
        .catch(err => {
            console.log('not possible to attend event');
            next(err);
        });
});

//List of all events
eventRouter.get("/list", routeGuard, (req, res, next) => {
    Event.find()
        .sort([
            ["date", -1]
        ])
        .then(events => {
            res.render("band/events/event-list", {
                events
            });
        })
        .catch(err => {
            console.log("didnt finde events");
            next(err);
        });
});

//search events
eventRouter.get("/search", routeGuard, (req, res, next) => {
    User.find({
            role: "artist"
        })
        .then(artists => {
            res.render("band/events/search", {
                artists
            });
        })
        .catch(err => {
            next(err);
        });
});

//filter by artist name
eventRouter.post("/filter/artist-name", routeGuard, (req, res, next) => {
    const bandName = req.body.artistName;
    Event.find({
            bandName: bandName
        })
        .sort([
            ["date", -1]
        ])
        .then(events => {
            res.render("band/events/event-list", {
                events
            });
        })
        .catch(err => {
            res.redirect('/search');
            next(err);
        });
});

//filter by genre
eventRouter.post('/filter/genre', routeGuard, (req, res, next) => {
    const genre = req.body.genre;
    console.log('this is genre', genre);
    Event.find({
            type: genre
        })
        .then(events => {
            res.render("band/events/event-list", {
                events
            });
        })
        .catch(err => {
            res.redirect('/search');
            console.log("step 3");
            next(err);
        });
});

//filter by city
eventRouter.post('/filter/city', routeGuard, (req, res, next) => {
    const city = req.body.city;
    console.log('req.body', req.body.city);
    Event.find({
           'address.city': city
        })
        .then(events => {
            console.log('we found a city', events);
            res.render("band/events/event-list", {
                events
            });
        })
        .catch(err => {
            res.redirect('/search');
            console.log("step 3");
            next(err);
        });
});

//get event profile
eventRouter.get("/profile/:event_id", routeGuard, (req, res, next) => {
    const eventId = req.params.event_id;
    Event.findById(eventId)
        .then(event => {
            res.render("band/events/profile", {
                event
            });
        })
        .catch(err => {
            console.log("didnt find event");
            next(err);
        });
});

//add-event page
eventRouter.get("/:band_id/add-event", routeGuard, (req, res, next) => {
    const bandId = req.params.band_id;
    if (
        JSON.stringify(bandId) === JSON.stringify(req.user._id) ||
        req.user.role === "admin"
    ) {
        res.render("band/events/add-event");
    } else {
        res.redirect(`/events/${bandId}`);
    }
});

//create the event
eventRouter.post("/:band_id/add-event", routeGuard, (req, res, next) => {
    const bandId = req.params.band_id;
    const artistName = req.user.artistName;
    const typeOfMusic = req.user.genres;
    const {
        nameOfEvent,
        site,
        road,
        building,
        floor,
        city,
        zip_code,
        latitude,
        longitude,
        description,
        price,
        date,
        time
    } = req.body;
    if (
        JSON.stringify(bandId) === JSON.stringify(req.user._id) ||
        req.user.role === "admin"
    ) {
        Event.create({
                bandId: bandId,
                nameOfEvent: nameOfEvent,
                address: {
                    site: site,
                    road: road,
                    building: building,
                    floor: floor,
                    city: city,
                    zip_code: zip_code,
                    latitude: latitude,
                    longitude: longitude
                },
                description: description,
                price: price,
                date: date,
                time: time,
                bandName: artistName,
                type: typeOfMusic
            })
            .then((event) => {
                res.redirect(`/events/${bandId}`);
            })
            .catch(err => {
                console.log("event not created");
                next(err);
            });
    } else {
        res.redirect(`/events/${bandId}`);
    }
});

//this are the events per band
eventRouter.get("/:band_id", routeGuard, (req, res, next) => {
    const bandId = req.params.band_id;
    Event.find({
            bandId: bandId
        })
        .then(results => {
            res.render("band/events/event-single-band", {
                results
            });
        })
        .catch(err => {
            console.log("not possible to find events from this band");
            res.redirect(`/events/${bandId}`);
            next(err);
        });
});

//here the bands can edit their own events
eventRouter.get("/edit/:event_id", routeGuard, (req, res, next) => {
    const eventId = req.params.event_id;
    const userLoggedIn = req.user._id;
    const userLoggedInrole = req.user.role;
    Event.findById(eventId)
        .then(event => {
            if (
                JSON.stringify(event.bandId) === JSON.stringify(userLoggedIn) ||
                userLoggedInrole === "admin"
            ) {
                res.render("band/events/edit", {
                    event
                });
            }
        })
        .catch(err => {
            next(err);
        });
});

///continue here for post and edit own events
eventRouter.post("/edit/:event_id", routeGuard, (req, res, next) => {
    const eventId = req.params.event_id;
    const userLoggedIn = req.user._id;
    const userLoggedInrole = req.user.role;
    const {
        nameOfEvent,
        site,
        road,
        building,
        floor,
        city,
        zip_code,
        latitude,
        longitude,
        description,
        price,
        date,
        time
    } = req.body;
    let event;
    Event.findById(eventId).then(eventfound => {
        event = eventfound;
        if (
            JSON.stringify(event.bandId) === JSON.stringify(userLoggedIn) ||
            userLoggedInrole === "admin"
        ) {
            return Event.findOneAndUpdate({
                    _id: eventId
                }, {
                    nameOfEvent: nameOfEvent,
                    address: {
                        site: site,
                        road: road,
                        building: building,
                        floor: floor,
                        city: city,
                        zip_code: zip_code,
                        latitude: latitude,
                        longitude: longitude
                    },
                    description: description,
                    price: price,
                    date: date,
                    time: time
                })
                .then(event => {
                    console.log("event edited", event);
                    res.redirect(`/events/${event.bandId}`);
                })
                .catch(err => {
                    next(err);
                });
        } else {
            res.redirect(`/events/${eventId}`);
        }
    });
});

eventRouter.post("/delete/:event_id", routeGuard, (req, res, next) => {
    const eventId = req.params.event_id;
    const userLoggedIn = req.user._id;
    const userLoggedInrole = req.user.role;
    let event;
    Event.findById(eventId).then(eventfound => {
        event = eventfound;
        if (
            JSON.stringify(event.bandId) === JSON.stringify(userLoggedIn) ||
            userLoggedInrole === "admin"
        ) {
            return Event.findByIdAndDelete(eventId).then(() => {
                console.log("event was deleted");
                res.redirect(`/events/${event.bandId}`);
            });
        } else {
            res.redirect(`/events/${eventId}`);
        }
    });
});

module.exports = eventRouter;