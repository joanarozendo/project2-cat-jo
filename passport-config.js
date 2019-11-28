/* eslint-disable prefer-arrow-callback */
const SpotifyStrategy = require('passport-spotify').Strategy;
const passport = require('passport');
const User = require('./models/user');


passport.serializeUser((user, callback) => {
    //..
    callback(null, user._id);
});
passport.deserializeUser((id, callback) => {
    User.findById(id)
        .then(user => {
            callback(null, user);
        })
        .catch(error => {
            callback(error);
        });
});

passport.use(
    new SpotifyStrategy({
            clientID: process.env.SPOTIFY_ID,
            clientSecret: process.env.SPOTIFY_SECRET,
            callbackURL: process.env.SPOTIFY_CALLBACK,
            showDialog: true,
            scope: ['user-read-email', 'user-read-private']
        },
        function (accessToken, refreshToken, expires_in, profile, callback) {
            User.findOne({
                    spotify_id: profile._json.id
                })
                .then(user => {
                    if (user) {
                        callback(null, user);
                    } else {
                        User.create({
                                email: profile._json.email,
                                spotify_access_token: accessToken,
                                spotify_refresh_token: refreshToken,
                                username: profile._json.display_name,
                                spotify_id: profile._json.id,
                                role: 'user',
                                genres: ["indie", "rock", "pop", "rap", "hip-pop", "metal", "fado"]
                            })
                            .then(user => {
                                //req.session.user = user._id;
                                callback(null, user);
                            })
                    }
                }).catch(err => {
                    console.log('profile id', profile._json.id);
                    callback(err)})
        }));