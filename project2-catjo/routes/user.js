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
    .populate("user images")
    .then(user_individual => {
      // console.log('LOG THIIIS', user_individual.images);
      res.render("user/profile", {
        user_individual
      });
    })
    .catch(error => {
      next(error);
    });
});

// GOING TO PROFILE EDIT PAGE
userRouter.get("/edit/:user_id", routeGuard, (req, res, next) => {
  const userId = req.params.user_id;
  if (
    JSON.stringify(userId) === JSON.stringify(req.user._id) ||
    req.user.role === "admin"
  ) {
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
  const {
    firstName,
    lastName,
    username,
    email,
    password,
    description
  } = req.body;
  if (
    JSON.stringify(userId) === JSON.stringify(req.user._id) ||
    req.user.role === "admin"
  ) {
    bcryptjs.hash(password, 10).then(hash => {
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
    .sort({
      creationDate: -1
    })
    .populate("user images")
    .then(user_individual => {
      res.render("user/list", {
        user_individual
      });
    })
    .catch(error => {
      next(error);
    });
});

// DELETE PROFILE
userRouter.post("/:user_id/delete", routeGuard, (req, res, next) => {
  const userId = req.params.user_id;
  if (
    JSON.stringify(userId) === JSON.stringify(req.user._id) ||
    req.user.role === "admin"
  ) {
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
