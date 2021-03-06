"use strict";

const { join } = require("path");
const express = require("express");
const createError = require("http-errors");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const sassMiddleware = require("node-sass-middleware");
const serveFavicon = require("serve-favicon");
const mongoose = require("mongoose");

//SESSIONS
const expressSession = require("express-session"); //passport1
const connectMongo = require("connect-mongo");
const MongoStore = connectMongo(expressSession);

//Require USER
const User = require("./models/user");

//ROUTES
const indexRouter = require("./routes/index");
const authenticationRouter = require("./routes/authentication");
const usersRouter = require("./routes/user");
const bandRouter = require("./routes/band");
const adminRouter = require("./routes/admin");
const eventRouter = require("./routes/event");
const postBandRouter = require("./routes/post_band");
const formRouter = require("./routes/form");

const app = express();

app.set("views", join(__dirname, "views"));
app.set("view engine", "hbs");

//Register partials
const hbs = require("hbs");
hbs.registerPartials(__dirname + "/views/partials");

//Register hbs helpers
hbs.registerHelper("ifBand", function(v1, options) {
  if (v1.role === "artist") {
    return options.fn(this);
  }
  return options.inverse(this);
});

hbs.registerHelper("ifUser", function(v1, options) {
  if (v1.role === "user") {
    return options.fn(this);
  }
  return options.inverse(this);
});

hbs.registerHelper("ifAdmin", function(v1, options) {
  if (v1.role === "admin") {
    return options.fn(this);
  }
  return options.inverse(this);
});

hbs.registerHelper("ifSameLoggedIn", function(arg1, arg2, options) {
  return JSON.stringify(arg1._id) == JSON.stringify(arg2._id)
    ? options.fn(this)
    : options.inverse(this);
});

hbs.registerHelper("ifNotSameLoggedIn", function(arg1, arg2, options) {
  return !JSON.stringify(arg1._id) == JSON.stringify(arg2._id)
    ? options.fn(this)
    : options.inverse(this);
});

hbs.registerHelper("ifNotSameThanEvent", function(arg1, arg2, options) {
  return !(JSON.stringify(arg1) === JSON.stringify(arg2._id))
    ? options.fn(this)
    : options.inverse(this);
});

hbs.registerHelper("ifSame", function(arg1, arg2, options) {
  return JSON.stringify(arg1) == JSON.stringify(arg2._id)
    ? options.fn(this)
    : options.inverse(this);
});

hbs.registerHelper("isAdmin", function(arg1, options) {
  if (arg1.role === "admin") {
    return options.fn(this);
  }
  return options.inverse(this);
});

hbs.registerHelper("ifAttend", function(arg1, arg2, options) {
  return arg1.attend_users_id.includes(arg2._id)
    ? options.fn(this)
    : options.inverse(this);
});

hbs.registerHelper("ifNotAttend", function(arg1, arg2, options) {
  return !arg1.attend_users_id.includes(arg2._id)
    ? options.fn(this)
    : options.inverse(this);
});

hbs.registerHelper("ifRated", function(arg1, arg2, options) {
  const usersThatRated = [];
  //In the following function we add all the ids of users that rated to the usersThatRated array.
  arg1.bandUsersRate.forEach(value => {
    usersThatRated.push(JSON.stringify(value.id));
  });

  //both objects were converted to string with JSON.stringify to allow comparison
  return usersThatRated.includes(JSON.stringify(arg2._id))
    ? options.fn(this)
    : options.inverse(this);
});

hbs.registerHelper("ifNotRated", function(arg1, arg2, options) {
  const usersThatRated = [];
  arg1.bandUsersRate.forEach(value => {
    usersThatRated.push(JSON.stringify(value.id));
  });
  return !usersThatRated.includes(JSON.stringify(arg2._id))
    ? options.fn(this)
    : options.inverse(this);
});

app.use(logger("dev"));
app.use(
  express.urlencoded({
    extended: true
  })
);
app.use(cookieParser()); //passport3
app.use(serveFavicon(join(__dirname, "public/images", "favicon.ico")));
app.use(
  sassMiddleware({
    src: join(__dirname, "public"),
    dest: join(__dirname, "public"),
    outputStyle:
      process.env.NODE_ENV === "development" ? "nested" : "compressed",
    sourceMap: true
  })
);
app.use(express.static(join(__dirname, "public"))); //passport2

//SETTING UP SESSION
app.use(
  expressSession({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
    cookie: {
      maxAge: 60 * 60 * 24 * 15,
      sameSite: "lax",
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development"
    },
    store: new MongoStore({
      mongooseConnection: mongoose.connection,
      ttl: 60 * 60 * 24
    })
  })
);

//PASSPORT CONFIG
require("./passport-config");

const passport = require("passport");

app.use(passport.initialize());
app.use(passport.session());

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
app.use("/", indexRouter);
app.use("/authentication", authenticationRouter);
app.use("/user", usersRouter);
app.use("/band", bandRouter);
app.use("/admin", adminRouter);
app.use("/events", eventRouter);
app.use("/band/post", postBandRouter);
app.use("/form", formRouter);

// Catch missing routes and forward to error handler
app.use("*", (req, res, next) => {
  const error = new Error("This page was not found.");
  error.status = 404;
  next(error);
});

// Catch all error handler
app.use((error, req, res, next) => {
  // Set error information, with stack only available in development
  res.locals.message = error.message;
  res.locals.error = req.app.get("env") === "development" ? error : {};

  res.status(error.status || 500);
  res.render("error");
  //to show error go to error view and add {{error.stack}}
});

module.exports = app;
