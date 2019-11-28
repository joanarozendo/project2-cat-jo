const {
  Router
} = require("express");
const bandRouter = new Router();
const bcryptjs = require("bcryptjs");
const routeGuard = require("./../middleware/route-guard");
const uploader = require("./../middleware/upload");

const User = require("./../models/user");
const Image = require("./../models/image");
const Post = require('./../models/post');



bandRouter.post('/profile/:band_id/rate', routeGuard, (req, res, next) => {
  const bandId = req.params.band_id;
  const rate = req.body.rate;
  const userId = req.user._id;
  console.log('req user id', req.user._id);
  User.findByIdAndUpdate(bandId, {
      $push: {
        bandUsersRate: {
          id: userId,
          rate: rate
        }
      }
    })
    .then(() => {
      return User.findById(bandId)
        .then(band => {
          const numberOfRates = band.bandUsersRate.length;
          const sumOfRates = band.bandUsersRate.map(value => {
            return value.rate
          }).reduce((acc, value) => {
            return acc + value
          }, 0);
          const rateAverage = (sumOfRates / numberOfRates).toFixed(1);
          return User.findByIdAndUpdate(bandId, {
              bandAverageRate: rateAverage
            })
            .then(() => {
              res.redirect(`/band/profile/${bandId}`);
            });
        });
    });
});



//Going to the band profile (all users have access if they are logged in)
bandRouter.get("/profile/:band_id", routeGuard, (req, res, next) => {
  const bandId = req.params.band_id;
  User.findById(bandId)
    .populate("user images")
    .then(band => {
      return Post.find({
          band: band._id
        })
        .populate('author images')
        .sort([
          ["creationDate", -1]
        ])
        .then(post => {
          console.log('posts were found!!!', post.images);
          res.render("band/profile", {
            band: band,
            post: post
          });
        }).catch(err => {
          console.log('no posts were found');
          res.render("band/profile", {
            band: band,
          })
        })
    })
    .catch(error => {
      next(error);
    });
});


//Going to the band edit profile (only the the band that is logged in can access its own profile editor)
bandRouter.get("/edit/:band_id", routeGuard, (req, res, next) => {
  const bandId = req.params.band_id;
  if (
    JSON.stringify(bandId) === JSON.stringify(req.user._id) ||
    req.user.role === "admin"
  ) {
    User.findById(bandId)
      .populate("user images")
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
bandRouter.post(
  "/edit/:band_id",
  routeGuard,
  uploader.array("images", 1),
  (req, res, next) => {
    const bandId = req.params.band_id;
    const {
      artistName,
      username,
      email,
      passwordHash,
      passRecoveryQuestion,
      description,
      genres,
      artistAlbums
    } = req.body;
    const imageObjectArray = (req.files || []).map(file => {
      return {
        url: file.url
      };
    });
    if (
      JSON.stringify(bandId) === JSON.stringify(req.user._id) ||
      req.user.role === "admin"
    ) {
      Image.create(imageObjectArray).then((images = []) => {
        const imageIds = images.map(image => image._id);
        return bcryptjs
          .hash(passwordHash, 10)
          .then(hash => {
            return User.findOneAndUpdate({
              _id: bandId
            }, {
              username: username,
              email: email,
              description: description,
              genres: genres,
              artistAlbums: artistAlbums,
              artistName: artistName,
              passwordHash: hash,
              passRecoveryQuestion: passRecoveryQuestion,
              images: imageIds
            });
          })
          .then(band => {
            console.log("The band was edited", band);
            res.redirect(`/band/profile/${bandId}`);
          })
          .catch(error => {
            console.log("The band was not edited");
            next(error);
          });
      });
    } else {
      res.redirect(`/band/profile/${bandId}`);
    }
  }
);

//-------------------------------------------------------------------------------------------------------
//Edit password
bandRouter.get("/edit-password/:band_id", routeGuard, (req, res, next) => {
  const bandId = req.params.band_id;
  if (
    JSON.stringify(bandId) === JSON.stringify(req.user._id) ||
    req.user.role === "admin"
  ) {
    User.findById(bandId)
      .populate("user images")
      .then(band => {
        res.render("band/edit-password", {
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


//Edit password
bandRouter.post("/edit-password/:band_id", routeGuard, (req, res, next) => {
  const bandId = req.params.band_id;
  const {
    passwordHash
  } = req.body;
  if (
    JSON.stringify(bandId) === JSON.stringify(req.user._id) ||
    req.user.role === "admin"
  ) {
    bcryptjs
      .hash(passwordHash, 10)
      .then(hash => {
        return User.findOneAndUpdate({
          _id: bandId
        }, {
          passwordHash: hash
        });
      })
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

//-------------------------------------------------------------------------------------------------------

//List bands
bandRouter.get("/list", routeGuard, (req, res, next) => {
  User.find({
      role: "artist"
    })
    .sort({
      artistName: -1
    })
    .populate("user images")
    .then(bands => {
      res.render("band/list", {
        bands
      });
    })
    .catch(err => {
      next(err);
    });
});

//Delete band
bandRouter.post("/delete/:band_id", routeGuard, (req, res, next) => {
  const bandId = req.params.band_id;
  if (
    JSON.stringify(bandId) === JSON.stringify(req.user._id) ||
    req.user.role === "admin"
  ) {
    User.findByIdAndDelete({
        _id: bandId
      })
      .then(() => {
        res.redirect("/");
      })
      .catch(err => {
        console.log("couldnt delete band");
        next(err);
      });
  } else {
    res.redirect(`/band/profile/${bandId}`);
  }
});

module.exports = bandRouter;