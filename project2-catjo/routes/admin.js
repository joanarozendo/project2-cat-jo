const { Router } = require("express");
const adminRouter = new Router();

const User = require("./../models/user");
const routeGuard = require("./../middleware/route-guard");
const bcryptjs = require("bcryptjs");

adminRouter.get("/profile/:user_id", routeGuard, (req, res, next) => {
  const userId = req.params.user_id;
  User.findById(userId)
    .populate("user images")
    .then(admin => {
      // console.log('IMAGEEEES', admin.images[0].url);
      
      res.render("admin/profile", {
        admin
      });
    })
    .catch(error => {
      next(error);
    });
});

adminRouter.get("/add-user-first-page", routeGuard, (req, res, next) => {
  if (req.user.role === "admin") {
    res.render("admin/add-users-firstpage");
  } else {
    new Error("You have no permissions to access this page");
  }
});

adminRouter.post("/add-user-first-page", routeGuard, (req, res, next) => {
  const { role } = req.body;
  // console.log("this is role", role);
  if (req.user.role === "admin") {
    if (role === "artist") {
      res.render("admin/add-artist");
    } else if (role === "user") {
      res.render("admin/add-user");
    } else if (role === "admin") {
      res.render("admin/add-admin");
    }
  } else {
    new Error("You have no permissions to access this page");
  }
});

adminRouter.post("/add-artist", routeGuard, (req, res, next) => {
  const {
    artistName,
    username,
    email,
    password,
    description,
    genres,
    artistAlbums
  } = req.body;
  if (req.user.role === "admin") {
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
          genres: genres,
          artistAlbums
        });
      })
      .then(band => {
        res.render("band/profile", {
          band
        });
      })
      .catch(error => {
        next(error);
      });
  } else {
    new Error("You have no permissions to access this page");
  }
});

adminRouter.post("/add-user", routeGuard, (req, res, next) => {
  const {
    firstName,
    lastName,
    username,
    email,
    password,
    description,
    genres
  } = req.body;
  if (req.user.role === "admin") {
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
      .then(user_individual => {
        res.render("user/profile", {
          user_individual
        });
      })
      .catch(error => {
        next(error);
      });
  } else {
    new Error("You have no permissions to access this page");
  }
});

module.exports = adminRouter;
