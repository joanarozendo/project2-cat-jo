const { Router } = require("express");
const bandRouter = new Router();

const routeGuard = require("./../middleware/route-guard");
const User = require("./../models/user");

//Going to the band profile (all users have access if they are logged in)
bandRouter.get("/profile/:band_id", routeGuard, (req, res, next) => {
  const bandId = req.params.band_id;
  User.findById(bandId)
    .then(band => {
      res.render("band/profile", {
        band
      });
    })
    .catch(error => {
      next(error);
    });
});

//Going to the band edit profile (only the the band that is logged in can access its own profile editor)
bandRouter.get("/edit/:band_id", routeGuard, (req, res, next) => {
  const bandId = req.params.band_id;
  if (JSON.stringify(bandId) === JSON.stringify(req.user._id)) {
    User.findById(bandId)
      .then(band => {
        res.render("band/edit", {
          band
        });
      })
      .catch(error => {
        next(error);
      });
  } else {
    res.redirect(`/band/profile/${bandId}`);
  }
});

//Going to the band edit profile (only the the band that is logged in can access its own profile editor)
bandRouter.post("/edit/:band_id", routeGuard, (req, res, next) => {
  const bandId = req.params.band_id;
  const { username, email, description } = req.body;
  if (JSON.stringify(bandId) === JSON.stringify(req.user._id)) {
    User.findOneAndUpdate(
      {
        _id: bandId
      },
      {
        username: username,
        email: email,
        description: description
      }
    )
      .then(band => {
        console.log("The band was edited", band);
        res.redirect(`/band/profile/${bandId}`);
      })
      .catch(error => {
        console.log("The band was not edited");
        next(error);
      });
  } else {
    res.redirect(`/band/profile/${bandId}`);
  }
});

module.exports = bandRouter;
