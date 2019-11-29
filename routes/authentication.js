const {
  Router
} = require("express");
const authenticationRouter = new Router();
const bcryptjs = require("bcryptjs");
const User = require("./../models/user");
const Image = require("./../models/image");
const nodemailer = require("nodemailer");

// PARAMETER THAT WILL CHECK IF USER IS LOGGED IN
const routeGuard = require("./../middleware/route-guard");

// MIDDLEWARE TO UPLOAD IMAGES
const uploader = require("./../middleware/upload");

const generateToken = length => {
  const characters =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let token = "";
  for (let i = 0; i < length; i++) {
    token += characters[Math.floor(Math.random() * characters.length)];
  }
  return token;
};

const ourEmail = process.env.EMAIL;
const ourPassword = process.env.PASSWORD;

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: ourEmail,
    pass: ourPassword
  }
});

function sendMail(user) {
  transporter.sendMail({
    from: `Music Inn <ourEmail>`,
    to: `${user.email}`,
    subject: "Confirm your account on Music Inn",
    html: `
    <p>Thanks for signing up with Music Inn, ${user.username}! Follow this link to activate your account:
    <br>"https://jam-up.herokuapp.com/authentication/confirm-email/${user.confirmationCode}"</a>
    <br>
    Have fun, 
    <br>
    The Music Inn Team
    <br>
    🎵🤘🎤🎷🎹🎸
    </p>
    `
  });
}

// BASIC AUTHENTICATION

// SIGN UP

// First Step: Choose Role
authenticationRouter.get("/signup-first-step", (req, res, next) => {
  res.render("authentication/signup-first-step");
});

authenticationRouter.post("/signup-first-step", (req, res, next) => {
  const {
    role
  } = req.body;
  if (role === "artist") {
    res.render("authentication/signup-artist");
  }
  if (role === "user") {
    res.render("authentication/signup-user");
  }
  if (role === "admin") {
    res.render("authentication/signup-admin");
  }
});

// Sign Up - ARTISTS
authenticationRouter.get("/signup-artist", (req, res, next) => {
  res.render("authentication/signup-artist");
});

authenticationRouter.post(
  "/signup-artist",
  uploader.array("images", 1),
  (req, res, next) => {
    let {
      artistName,
      username,
      email,
      passwordHash,
      passRecoveryQuestion,
      description,
      genres,
      artistAlbums,
      bandWebsite
    } = req.body;
    if (!genres) {
      genres = ["indie", "rock", "pop", "rap", "hip-pop", "metal", "fado"]
    }
    const imageObjectArray = (req.files || []).map(file => {
      return {
        url: file.url
      };
    });
    Image.create(imageObjectArray).then((images = []) => {
      let newConfirmationCode = generateToken(12);
      const imageIds = images.map(image => image._id);
      return bcryptjs
        .hash(passwordHash, 10)
        .then(hash => {
          return User.create({
            artistName,
            username,
            email,
            passwordHash: hash,
            passRecoveryQuestion,
            role: "artist",
            description,
            genres: genres,
            artistAlbums,
            images: imageIds,
            confirmationCode: newConfirmationCode,
            bandWebsite
          });
        })
        .then(user => {
          sendMail(user);
          req.session.user = user._id;
          req.user = user;
          res.redirect("/authentication/pending-confirmation");
        })
        .catch(error => {
          next(new Error(`It was not possible to create that user.`));
        });
    });
  }
);

authenticationRouter.get("/pending-confirmation", (req, res, next) => {
  res.render("authentication/pending-confirmation");
});

authenticationRouter.get("/confirm-email/:mailToken", (req, res, next) => {
  const mailToken = req.params.mailToken;
  User.findOneAndUpdate({
      confirmationCode: mailToken
    }, {
      status: "Active"
    })
    .then(user => {
      req.session.user = user._id;
      res.redirect("/authentication/confirmation-page");
    })
    .catch(err => next(new Error(`Confirmation e-mail. You have no permission to access this page.`)));
});

authenticationRouter.get("/confirmation-page", (req, res, next) => {
  res.render("authentication/confirmation-page");
});

// Sign Up - USERS
authenticationRouter.get("/signup-user", (req, res, next) => {
  res.render("authentication/signup-user");
});

authenticationRouter.post(
  "/signup-user",
  uploader.array("images", 1),
  (req, res, next) => {
    let {
      firstName,
      lastName,
      username,
      email,
      passwordHash,
      passRecoveryQuestion,
      description,
      genres
    } = req.body;
    if (!genres) {
      genres = ["indie", "rock", "pop", "rap", "hip-pop", "metal", "fado"]
    }
    const imageObjectArray = (req.files || []).map(file => {
      return {
        url: file.url
      };
    });
    Image.create(imageObjectArray).then((images = []) => {
      let newConfirmationCode = generateToken(12);
      const imageIds = images.map(image => image._id);
      return bcryptjs
        .hash(passwordHash, 10)
        .then(hash => {
          return User.create({
            firstName,
            lastName,
            username,
            email,
            passwordHash: hash,
            passRecoveryQuestion,
            role: "user",
            description,
            genres: genres,
            images: imageIds,
            confirmationCode: newConfirmationCode
          });
        })
        .then(user => {
          sendMail(user);
          req.session.user = user._id;
          res.redirect("/authentication/pending-confirmation");
        })
        .catch(error => {
          next(new Error(`It was not possible to create that user.`));
        });
    });
  }
);

// Sign Up - ADMINISTRATOR
authenticationRouter.get("/signup-admin", (req, res, next) => {
  res.render("authentication/signup-admin");
});

authenticationRouter.post(
  "/signup-admin",
  uploader.array("images", 1),
  (req, res, next) => {
    const {
      firstName,
      lastName,
      username,
      email,
      passwordHash,
      passRecoveryQuestion
    } = req.body;
    const imageObjectArray = (req.files || []).map(file => {
      return {
        url: file.url
      };
    });
    Image.create(imageObjectArray).then((images = []) => {
      const imageIds = images.map(image => image._id);
      return bcryptjs
        .hash(passwordHash, 10)
        .then(hash => {
          let newConfirmationCode = generateToken(12);

          return User.create({
            firstName,
            lastName,
            username,
            email,
            passwordHash: hash,
            passRecoveryQuestion,
            role: "admin",
            status: "Active",
            images: imageIds,
            confirmationCode: newConfirmationCode
          });
        })
        .then(user => {
          req.session.user = user._id;
          res.redirect("/");
        })
        .catch(error => {
          next(new Error(`It was not possible to create that user.`));
        });
    });
  }
);

// LOG IN
authenticationRouter.get("/login", (req, res, next) => {
  res.render("authentication/login");
});

authenticationRouter.post("/login", (req, res, next) => {
  let userId;
  const {
    email,
    password
  } = req.body;
  User.findOne({
      email
    })
    .then(user => {
      if (!user) {
        res.render("authentication/login", {
          errorMessageEmail: "There's no user with that email... Try again."
          // return Promise.reject(new Error("Wrong password."));
        });
        // return Promise.reject(new Error("There's no user with that email."));
      } else {
        userId = user._id;
        return bcryptjs.compare(password, user.passwordHash);
      }
    })
    .then(result => {
      if (result) {
        req.session.user = userId;
        res.redirect("/dashboard");
      } else {
        res.render("authentication/login", {
          errorMessagePassword: "Wrong password! Try again."
          // return Promise.reject(new Error("Wrong password."));
        });
      }
    })
    .catch(error => {
      next(new Error(`There was an error in log-in.`));
    });
});

// PASSWORD RECOVERY
authenticationRouter.get("/password-recovery", (req, res, next) => {
  res.render("authentication/password-recovery");
});

authenticationRouter.post("/password-recovery", (req, res, next) => {
  let userId;
  const {
    email,
    passRecoveryQuestion
  } = req.body;
  User.findOne({
      email
    })
    .then(user => {
      if (!user) {
        return Promise.reject(new Error("There's no user with that email."));
      } else {
        userId = user._id;
        return user;
      }
    })
    .then(user => {
      let passRecoveryQuestionInput = passRecoveryQuestion.toLowerCase();
      if (user.passRecoveryQuestion !== passRecoveryQuestionInput) {
        return Promise.reject(new Error("Wrong answer."));
      } else {
        req.session.user = userId;
        User.findById(userId).then(user => {
          if (user.role === "artist") {
            res.redirect(`/band/edit-password/${user._id}`);
          }
          if (user.role === "user") {
            res.redirect(`/user/edit-password/${user._id}`);
          }
          if (user.role === "admin") {
            res.redirect(`/admin/edit-password/${user._id}`);
          }
        });
      }
    })
    .catch(error => {
      next(new Error(`You have no permission to access this password recovery page.`))
    });
});


// LOG OUT
authenticationRouter.post("/logout", (req, res, next) => {
  req.session.destroy();
  res.redirect("/");
});

///SPOTIFY ROUTES
const passport = require("passport");

authenticationRouter.get(
  "/spotify",
  passport.authenticate("spotify", {
    scope: ["user-read-email", "user-read-private"],
    showDailog: true
  }),
  function (req, res) {
    // console.log("in the spotify function");
  }
);

authenticationRouter.get(
  "/spotify/callback",
  passport.authenticate("spotify", {
    showDailog: true,
    failureRedirect: "/authentication/login" //failure
  }),
  function (req, res) {
    // req.user._id = req.session.passport
    req.session.user = req.user._id;
    res.redirect(`/dashboard`); //if success will redirect for the profile edition
  }
);

module.exports = authenticationRouter;