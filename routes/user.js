"use strict";

const {
  Router
} = require("express");
const userRouter = new Router();
const bcryptjs = require("bcryptjs");
const routeGuard = require("./../middleware/route-guard");
const uploader = require("./../middleware/upload");
const User = require("./../models/user");
const Image = require("./../models/image");


// GOING TO USER PROFILE
userRouter.get("/profile/:user_id", routeGuard, (req, res, next) => {
  const userId = req.params.user_id;
  User.findById(userId)
    .populate("user images")
    .then(user_individual => {
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
      .populate("user images")

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
userRouter.post(
  "/edit/:user_id",
  routeGuard,
  uploader.array("images", 1),
  (req, res, next) => {
    const userId = req.params.user_id;
    const {
      firstName,
      lastName,
      username,
      email,
      passwordHash,
      passRecoveryQuestion,
      description,
      genres
    } = req.body;
    const imageObjectArray = (req.files || []).map(file => {
      return {
        url: file.url
      };
    });
    if (
      JSON.stringify(userId) === JSON.stringify(req.user._id) ||
      req.user.role === "admin"
    ) {
      Image.create(imageObjectArray).then((images = []) => {
        const imageIds = images.map(image => image._id);
        return bcryptjs
          .hash(passwordHash, 10)
          .then(hash => {
            return User.findOneAndUpdate({
              _id: userId
            }, {
              firstName: firstName,
              lastName: lastName,
              username: username,
              email: email,
              passwordHash: hash,
              passRecoveryQuestion,
              description: description,
              images: imageIds,
              genres: genres
            })
          })

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
  }
);


//-------------------------------------------------------------------------------------------------------

userRouter.get("/edit-password/:user_id", routeGuard, (req, res, next) => {
  const userId = req.params.user_id;
  if (
    JSON.stringify(userId) === JSON.stringify(req.user._id) ||
    req.user.role === "admin"
  ) {
    User.findById(userId)
      .populate("user images")
      .then(user => {
        res.render("user/edit-password", {
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

userRouter.post("/edit-password/:user_id", routeGuard, (req, res, next) => {
  const userId = req.params.user_id;
  const {
    passwordHash
  } = req.body;
  if (
    JSON.stringify(userId) === JSON.stringify(req.user._id) ||
    req.user.role === "admin"
  ) {
    bcryptjs
      .hash(passwordHash, 10)
      .then(hash => {
        return User.findOneAndUpdate({
          _id: userId
        }, {
          passwordHash: hash
        });
      })
      .then(user => {
        console.log("The user was edited", user);
        res.redirect(`/user/profile/${userId}`);
      })
      .catch(error => {
        console.log("The user was not edited");
        next(error);
      });
  } else {
    res.redirect(`/user/profile/${userId}`);
  }
});

//-------------------------------------------------------------------------------------------------------



// GOING TO USER LIST VIEW
userRouter.get("/list", routeGuard, (req, res, next) => {
  // console.log(req.params);
  User.find({
      role: "user"
    })
    .sort({
      firstName: -1
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