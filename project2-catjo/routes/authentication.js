const { Router } = require("express");
const authenticationRouter = new Router();
const bcryptjs = require("bcryptjs");
const User = require('./../models/user');

//PARAMETER THAT WILL CHECK IF USER IS LOGGED IN
const routeGuard = require("./../middleware/route-guard");

//here we will do the login sign up/log in/sign out
// Sign Up
authenticationRouter.get('/signup', (req, res, next) => {
  res.render('authentication/signup');
});

authenticationRouter.post('/signup', (req, res, next) => {
  const { name, username, email, password, description, role, favoriteGenres, artistGenre, artistAlbums } = req.body;
  bcryptjs
    .hash(password, 10)
    .then(hash => {
      return User.create({
        name,
        username,
        email,
        passwordHash: hash,
        description,
        role,
        favoriteGenres,
        artistGenre,
        artistAlbums
      });
    })
    .then(user => {
      req.session.user = user._id;
      res.redirect('/');
    })
    .catch(error => {
      next(error);
    });
});

// Log In
authenticationRouter.get('/login', (req, res, next) => {
  res.render('authentication/login');
});

authenticationRouter.post('/login', (req, res, next) => {
  let userId;
  const { email, password } = req.body;
  User.findOne({ email })
    .then(user => {
      if (!user) {
        return Promise.reject(new Error("There's no user with that email."));
      } else {
        userId = user._id;
        return bcryptjs.compare(password, user.passwordHash);
      }
    })
    .then(result => {
      if (result) {
        req.session.user = userId;
        res.redirect('/');
      } else {
        return Promise.reject(new Error('Wrong password.'));
      }
    })
    .catch(error => {
      next(error);
    });
});

// Log Out
authenticationRouter.post('/logout', (req, res, next) => {
  req.session.destroy();
  res.redirect('/');
});

// Private
authenticationRouter.get('/private', routeGuard, (req, res, next) => {
  res.render('private');
});

module.exports = authenticationRouter;
