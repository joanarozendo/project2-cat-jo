const {
  Router
} = require("express");
const adminRouter = new Router();
const bcryptjs = require("bcryptjs");
const routeGuard = require("./../middleware/route-guard");
const uploader = require("./../middleware/upload");
const User = require("./../models/user");
const Image = require("./../models/image");
const generateToken = length => {
  const characters =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let token = "";
  for (let i = 0; i < length; i++) {
    token += characters[Math.floor(Math.random() * characters.length)];
  }
  return token;
};


adminRouter.get("/profile/:user_id", routeGuard, (req, res, next) => {
  const userId = req.params.user_id;
  User.findById(userId)
    .populate("user images")
    .then(admin => {
      res.render("admin/profile", {
        admin
      });
    })
    .catch(error => {
      next(error);
    });
});

// -------------------------------------------------------------------------------------------------

adminRouter.get("/edit/:admin_id", routeGuard, (req, res, next) => {
  const adminId = req.params.admin_id;
  if (JSON.stringify(adminId) === JSON.stringify(req.user._id)) {
    User.findById(adminId)
      .populate("user images")
      .then(admin => {
        res.render("admin/edit", {
          admin
        });
      })
      .catch(error => {
        next(error);
      });
  } else {
    res.redirect(`/admin/profile/${adminId}`);
  }
});

adminRouter.post(
  "/edit/:admin_id",
  routeGuard,
  uploader.array("images", 1),
  (req, res, next) => {
    const adminId = req.params.admin_id;
    const {
      firstName,
      lastName,
      username,
      email,
      passRecoveryQuestion
    } = req.body;
    const imageObjectArray = (req.files || []).map(file => {
      return {
        url: file.url
      };
    });
    if (JSON.stringify(adminId) === JSON.stringify(req.user._id)) {
      Image.create(imageObjectArray).then((images = []) => {
        const imageIds = images.map(image => image._id);
        return  User.findOneAndUpdate({
              _id: adminId
            }, {
              firstName: firstName,
              lastName: lastName,
              username: username,
              email: email,
              passRecoveryQuestion: passRecoveryQuestion,
              images: imageIds
            })
          .then(admin => {
            res.redirect(`/admin/profile/${adminId}`);
          })
          .catch(error => {
            console.log("The admin was not edited");
            next(error);
          });
      });
    } else {
      res.redirect(`/admin/profile/${adminId}`);
    }
  }
);

// -------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------------

adminRouter.get("/edit-password/:admin_id", routeGuard, (req, res, next) => {
  const adminId = req.params.admin_id;
  if (
    JSON.stringify(adminId) === JSON.stringify(req.user._id)
  ) {
    User.findById(adminId)
      .populate("user images")
      .then(user => {
        res.render("admin/edit-password", {
          user
        });
      })
      .catch(error => {
        next(error);
      });
  } else {
    res.redirect(`/admin/profile/${adminId}`);
  }
});

adminRouter.post("/edit-password/:admin_id", routeGuard, (req, res, next) => {
  const adminId = req.params.admin_id;
  const {
    passwordHash
  } = req.body;
  if (
    JSON.stringify(adminId) === JSON.stringify(req.user._id)
  ) {
    bcryptjs
      .hash(passwordHash, 10)
      .then(hash => {
        return User.findOneAndUpdate({
          _id: adminId
        }, {
          passwordHash: hash
        });
      })
      .then(admin => {
        console.log("The user was edited", admin);
        res.redirect(`/admin/profile/${adminId}`);
      })
      .catch(error => {
        console.log("The admin was not edited");
        next(error);
      });
  } else {
    res.redirect(`/admin/profile/${adminId}`);
  }
});

//-------------------------------------------------------------------------------------------------------



adminRouter.get("/add-user-first-page", routeGuard, (req, res, next) => {
  if (req.user.role === "admin") {
    res.render("admin/add-users-firstpage");
  } else {
    new Error("You have no permissions to access this page");
  }
});

adminRouter.post("/add-user-first-page", routeGuard, (req, res, next) => {
  const {
    role
  } = req.body;
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
        let newConfirmationCode = generateToken(12);
        return User.create({
          artistName,
          username,
          email,
          passwordHash: hash,
          role: "artist",
          description,
          genres: genres,
          artistAlbums,
          confirmationCode: newConfirmationCode
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
  console.log('req.body', req.body);
  if (req.user.role === "admin") {
    bcryptjs
      .hash(password, 10)
      .then(hash => {
        let newConfirmationCode = generateToken(12);
        console.log('step 1');
        return User.create({
          firstName,
          lastName,
          username,
          email,
          passwordHash: hash,
          role: "user",
          description,
          genres,
          confirmationCode: newConfirmationCode
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