'use strict';

const {
  join
} = require('path');
const express = require('express');
const createError = require('http-errors');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const sassMiddleware = require('node-sass-middleware');
const serveFavicon = require('serve-favicon');
const mongoose = require('mongoose');

//SESSIONS
const expressSession = require('express-session');
const connectMongo = require('connect-mongo');
const MongoStore = connectMongo(expressSession);

//Require USER
const User = require('./models/user')

//ROUTES
const indexRouter = require('./routes/index');
const authenticationRouter = require('./routes/authentication');
const usersRouter = require('./routes/user');
const bandRouter = require('./routes/band');
const adminRouter = require('./routes/admin');


const app = express();

app.set('views', join(__dirname, 'views'));
app.set('view engine', 'hbs');

//Register partials
const hbs = require('hbs');
hbs.registerPartials(__dirname + '/views/partials');

app.use(logger('dev'));
app.use(express.urlencoded({
  extended: true
}));
app.use(cookieParser());
app.use(serveFavicon(join(__dirname, 'public/images', 'favicon.ico')));
app.use(sassMiddleware({
  src: join(__dirname, 'public'),
  dest: join(__dirname, 'public'),
  outputStyle: process.env.NODE_ENV === 'development' ? 'nested' : 'compressed',
  sourceMap: true
}));
app.use(express.static(join(__dirname, 'public')));


//SETTING UP SESSION
app.use(
  expressSession({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
    cookie: {
      maxAge: 60 * 60 * 24 * 15,
      sameSite: true,
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development'
    },
    store: new MongoStore({
      mongooseConnection: mongoose.connection,
      ttl: 60 * 60 * 24
    })
  })
);

//GETTING ACCESS TO THE USER IN LOCALS

app.use((req, res, next) => {
  const userId = req.session.user;
  if (userId) {
    User.findById(userId)
      .then(user => {
        req.user = user;
        res.locals.user = req.user;
        next();
      })
      .catch(error => {
        next(error);
      });
  } else {
    next();
  }
});

//APP USER ROUTES
app.use('/', indexRouter);
app.use('/authentication', authenticationRouter);
app.use('/user', usersRouter);
app.use('/band', bandRouter);
app.use('/admin', adminRouter);

// Catch missing routes and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// Catch all error handler
app.use((error, req, res, next) => {
  // Set error information, with stack only available in development
  res.locals.message = error.message;
  res.locals.error = req.app.get('env') === 'development' ? error : {};

  res.status(error.status || 500);
  res.render('error');
});

module.exports = app;