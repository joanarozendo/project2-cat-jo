const { Router } = require("express");
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
  // console.log(token);
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
    <p>Thanks for signing up with Music Inn! You must follow this link to activate your account:
    <br>
    <a href="http://localhost:3000/authentication/confirm-email/${user.confirmationCode}">http://localhost:3000/authentication/confirm-email/${user.confirmationCode}</a>
    <br>
    Have fun, 
    <br>
    The Music Inn Team 
    🎵🤘🎤🎷🎹🎸
    </p>
    `
  });
}
/* <h1>PLEASE WORK</h1></h1> */
/* please confirm your email 
    <a href="http://localhost:3000/authentication/confirm-email/${user.confirmationCode}">here</a> */

//here we will do the login sign up/log in/sign out
// Sign Up - First Step - Choose Role
authenticationRouter.get("/signup-first-step", (req, res, next) => {
  res.render("authentication/signup-first-step");
});

authenticationRouter.post("/signup-first-step", (req, res, next) => {
  const { role } = req.body;
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

// Sign Up - Artists
authenticationRouter.get("/signup-artist", (req, res, next) => {
  res.render("authentication/signup-artist");
});

authenticationRouter.post(
  "/signup-artist",
  uploader.array("images", 1),
  (req, res, next) => {
    // console.log(req.file);
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
    // console.log("GENRES", req.body.genres);
    const imageObjectArray = (req.files || []).map(file => {
      return {
        url: file.url
      };
    });
    Image.create(imageObjectArray).then((images = []) => {
      let newConfirmationCode = generateToken(12);
      const imageIds = images.map(image => image._id);
      // console.log("HEEEERE", imageIds);
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
            genres,
            artistAlbums,
            images: imageIds,
            confirmationCode: newConfirmationCode
          });
        })
        .then(user => {
          sendMail(user);
          req.session.user = user._id;
          res.redirect("/authentication/pending-confirmation");
          // res.redirect("/");
        })
        .catch(error => {
          next(error);
        });
    });
  }
);

authenticationRouter.get("/pending-confirmation", (req, res, next) => {
  // console.log("UNDEFINED?",req.session.user);
  res.render("authentication/pending-confirmation");
});

authenticationRouter.get("/confirm-email/:mailToken", (req, res, next) => {
  const mailToken = req.params.mailToken;
  User.findOneAndUpdate({ confirmationCode: mailToken }, { status: "Active" })
    .then(user => {
      // console.log('USER', user);
      req.session.user = user._id;
      res.redirect("/authentication/confirmation-page");
    })
    .catch(err => next(err));
});

authenticationRouter.get("/confirmation-page", (req, res, next) => {
  // console.log("UNDEFINED?", req.params);
  res.render("authentication/confirmation-page");
});

// Sign Up - Users
authenticationRouter.get("/signup-user", (req, res, next) => {
  res.render("authentication/signup-user");
});

authenticationRouter.post(
  "/signup-user",
  uploader.array("images", 1),
  (req, res, next) => {
    const {
      firstName,
      lastName,
      username,
      email,
      passwordHash,
      description,
      genres
    } = req.body;
    const imageObjectArray = (req.files || []).map(file => {
      return {
        url: file.url
      };
    });
    Image.create(imageObjectArray).then((images = []) => {
      const imageIds = images.map(image => image._id);
      // console.log("HEEEERE", imageIds);
      return bcryptjs
        .hash(passwordHash, 10)
        .then(hash => {
          return User.create({
            firstName,
            lastName,
            username,
            email,
            passwordHash: hash,
            role: "user",
            description,
            genres,
            images: imageIds
          });
        })
        .then(user => {
          // console.log("IMAGESSSS", images);
          req.session.user = user._id;
          res.redirect("/");
        })
        .catch(error => {
          next(error);
        });
    });
  }
);

// Sign Up - Admin
authenticationRouter.get("/signup-admin", (req, res, next) => {
  res.render("authentication/signup-admin");
});

authenticationRouter.post(
  "/signup-admin",
  uploader.array("images", 1),
  (req, res, next) => {
    const { firstName, lastName, username, email, passwordHash } = req.body;
    const imageObjectArray = (req.files || []).map(file => {
      return {
        url: file.url
      };
    });
    Image.create(imageObjectArray).then((images = []) => {
      const imageIds = images.map(image => image._id);
      // console.log("HEEEERE", imageIds);
      return bcryptjs
        .hash(passwordHash, 10)
        .then(hash => {
          return User.create({
            firstName,
            lastName,
            username,
            email,
            passwordHash: hash,
            role: "admin",
            images: imageIds
          });
        })
        .then(user => {
          req.session.user = user._id;
          res.redirect("/");
        })
        .catch(error => {
          next(error);
        });
    });
  }
);

// Log In
authenticationRouter.get("/login", (req, res, next) => {
  res.render("authentication/login");
});

authenticationRouter.post("/login", (req, res, next) => {
  let userId;
  const { email, password } = req.body;
  User.findOne({
    email
  })
    .then(user => {
      if (!user) {
        return Promise.reject(new Error("There's no user with that email."));
      } else {
        userId = user._id;
        console.log(password === user.passwordHash);
        return bcryptjs.compare(password, user.passwordHash);
      }
    })
    .then(result => {
      if (result) {
        req.session.user = userId;
        res.redirect("/");
      } else {
        return Promise.reject(new Error("Wrong password."));
      }
    })
    .catch(error => {
      next(error);
    });
});

authenticationRouter.get("/password-recovery", (req, res, next) => {
  // User.findById
  res.render("authentication/password-recovery");
});

authenticationRouter.get("/edit-password", (req, res, next) => {
  res.render("edit-password");
});

authenticationRouter.post("/password-recovery", (req, res, next) => {
  let userId;
  const { email, passRecoveryQuestion } = req.body;
  console.log(req.body.email)

  User.findOne({
    email
  })
    .then(user => {
      console.log(user)

      if (!user) {
        return Promise.reject(new Error("There's no user with that email."));
      } else {
        userId = user._id;
        return user;
      }
    })
    .then(user => {
      if (passRecoveryQuestion === user.passRecoveryQuestion) {
        req.session.user = userId;
        res.redirect("/edit-password");
      } else {
        return Promise.reject(new Error("Wrong answer."));
      }
    })
    .catch(error => {
      next(error);
    });
});


// Log Out
authenticationRouter.post("/logout", (req, res, next) => {
  req.session.destroy();
  res.redirect("/");
});

// Private
authenticationRouter.get("/private", routeGuard, (req, res, next) => {
  res.render("private");
});

module.exports = authenticationRouter;
