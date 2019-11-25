const { Router } = require("express");
const authenticationRouter = new Router();
const bcryptjs = require("bcryptjs");
const User = require('./../models/user');

//PARAMETER THAT WILL CHECK IF USER IS LOGGED IN
const routeGuard = require("./../middleware/route-guard");

//here we will do the login sign up/log in/sign out
// Sign Up - First Step - Choose Role
authenticationRouter.get('/signup-first-step', (req, res, next) => {
  res.render('authentication/signup-first-step');
});

authenticationRouter.post('/signup-first-step', (req, res, next) => {
  const { role } = req.body;
  if (role === "artist") {
    res.render('authentication/signup-artist');
  }
  if (role === "user") {
    res.render('authentication/signup-user');
  }
  if (role === "admin") {
    res.render('authentication/signup-admin');
  }
});

// Sign Up - Artists
authenticationRouter.get('/signup-artist', (req, res, next) => {
  res.render('authentication/signup-artist');
});

authenticationRouter.post('/signup-artist', (req, res, next) => {
  const { artistName, username, email, password, description, genres, artistAlbums } = req.body;
  bcryptjs
  .hash(password, 10)
  .then(hash => {
    return User.create({
      artistName,
      username,
      email,
      passwordHash: hash,
      role: "artist",
      description,
        genres,
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
  
  // Sign Up - Users
  authenticationRouter.get('/signup-user', (req, res, next) => {
    res.render('authentication/signup-user');
  });
  
  authenticationRouter.post('/signup-user', (req, res, next) => {
    const { firstName, lastName, username, email, password, description, genres } = req.body;
    console.log('GENRES', req.body.genres);
    bcryptjs
    .hash(password, 10)
    .then(hash => {
      return User.create({
        firstName,
        lastName,
        username,
        email,
        passwordHash: hash,
        role: "user",
        description,
        genres
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
  
  // Sign Up - Admin
authenticationRouter.get('/signup-admin', (req, res, next) => {
  res.render('authentication/signup-admin');
});

authenticationRouter.post('/signup-admin', (req, res, next) => {
  const { firstName, lastName, username, email, password } = req.body;
  bcryptjs
    .hash(password, 10)
    .then(hash => {
      return User.create({
        firstName,
        lastName,
        username,
        email,
        passwordHash: hash,
        role: "admin"
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
