const {
  Router
} = require("express");
const bandRouter = new Router();
const bcryptjs = require("bcryptjs");
const routeGuard = require("./../middleware/route-guard");
const uploader = require("./../middleware/upload");
const nodemailer = require("nodemailer");

const User = require("./../models/user");
const Image = require("./../models/image");
const Post = require('./../models/post');

const ourEmail = process.env.EMAIL;
const ourPassword = process.env.PASSWORD;

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: ourEmail,
    pass: ourPassword
  }
});

function sendMailToBand(userMessage, band) {
  transporter.sendMail({
    from: `Music Inn <ourEmail>`,
    to: `${band.email}`,
    subject: `Someone sent you a message...`,
    html: ` 
    <p>
    ${userMessage.name} (${userMessage.email}) sent you a message! Here it is:
    "${userMessage.message}"
    Enjoy,
    The Music Inn Team 
    🎵🤘🎤🎷🎹🎸
    </p>
    `
  });
}

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
    // console.log("THIS IS ROLE OF SESSION", req.user.role);
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

bandRouter.get("/list", routeGuard, (req, res, next) => {
  User.find({
      role: "artist"
    })
    .sort({
      creationDate: -1
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

bandRouter.get("/contact-form/:band_id", routeGuard, (req, res, next) => {
  const bandId = req.params.band_id;
  // console.log(bandId);
  User.findById(bandId)
  .then(band => {
    res.render(`band/contact-form`, {
      band
    });
  })
  .catch(error => {
    next(error);
  });
});

bandRouter.post("/contact-form/:band_id", routeGuard, (req, res, next) => {
  const bandId = req.params.band_id;
  const userMessage = req.body;
  // console.log(bandId);
  // console.log(userMessage);
  User.findById(bandId)
  .then(band => {
    sendMailToBand(userMessage, band);
    console.log('SENT MAIL TO BAND');
    res.redirect("/band/successful-contact");
    // console.log('USER MESSAGE', userMessage);
    // console.log('BAND', band);
  })
  .catch(error => {
      next(error);
    });
  });
  
  bandRouter.get("/successful-contact", routeGuard, (req, res, next) => {
    console.log('OIIIIIIIIIIIIII');
    res.render("band/successful-contact");
  });

  module.exports = bandRouter;
