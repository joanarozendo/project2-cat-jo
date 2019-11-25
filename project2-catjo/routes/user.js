"use strict";

const { Router } = require("express");
const userRouter = new Router();
const routeGuard = require("./../middleware/route-guard");
const User = require("./../models/user");
const bcryptjs = require("bcryptjs");

// GOING TO USER PROFILE
userRouter.get("/profile/:user_id", routeGuard, (req, res, next) => {
  const userId = req.params.user_id;
  User.findById(userId)
    .then(user => {
      res.render("user/profile", {
        user
      });
    })
    .catch(error => {
      next(error);
    });
});

// GOING TO PROFILE EDIT PAGE
userRouter.get("/edit/:user_id", routeGuard, (req, res, next) => {
  const userId = req.params.user_id;
  if (JSON.stringify(userId) === JSON.stringify(req.user._id)) {
    User.findById(userId)
      .then(user => {
        res.render("user/edit", {
          user
        });
      })
      .catch(error => {
        next(error);
      });
  } else {
    res.redirect(`/user/profile/${userId}`);
  }
});

// EDITING USER PROFILE
userRouter.post("/edit/:user_id", routeGuard, (req, res, next) => {
  const userId = req.params.user_id;
  const {firstName,
    lastName,
    username,
    email,
    password,
    description} = req.body;
    console.log('PASS', password);
    
  if (JSON.stringify(userId) === JSON.stringify(req.user._id)) {
    bcryptjs
    .hash(password, 10)
    .then(hash => {
      return User.findOneAndUpdate(
        {
          _id: userId
        },
        {
          firstName: firstName,
          lastName: lastName,
          username: username,
          email: email,
          passwordHash: hash,
          description: description
        }
      )
        .then(user => {
          console.log("The user was edited", user);
          res.redirect(`/user/profile/${userId}`);
        })
        .catch(error => {
          console.log("The user was not edited");
          next(error);
        });
    });
  } else {
    res.redirect(`/user/profile/${userId}`);
  }
});

// GOING TO USER LIST VIEW
userRouter.get("/list", routeGuard, (req, res, next) => {
  // console.log(req.params);
  User.find({
    role: "user"
  })
    .then(user => {
      res.render("user/list", {
        user
      });
    })
    .catch(error => {
      next(error);
    });
});

// DELETE PROFILE
userRouter.post("/:user_id/delete", routeGuard, (req, res, next) => {
  const userId = req.params.user_id;
  if (JSON.stringify(userId) === JSON.stringify(req.user._id)) {
    User.findByIdAndDelete({
      _id: userId
    })
      .then(res.redirect("/"))
      .catch(error => {
        next(error);
      });
  }
});

module.exports = userRouter;
