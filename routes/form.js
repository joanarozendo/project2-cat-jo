const {
  Router
} = require("express");
const formRouter = new Router();
const routeGuard = require("./../middleware/route-guard");
const nodemailer = require("nodemailer");

const User = require("./../models/user");

const ourEmail = process.env.EMAIL;
const ourPassword = process.env.PASSWORD;

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: ourEmail,
    pass: ourPassword
  }
});

function sendMailFromForm(userMessage, user) {
  transporter.sendMail({
    from: `Music Inn <ourEmail>`,
    to: `${user.email}`,
    subject: `Someone sent you a message...`,
    html: ` 
    <p>
    ${userMessage.name} (${userMessage.email}) sent you a message!
    <br> 
    Here it is:
    <br>
    "${userMessage.message}"
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

formRouter.get("/contact-form/:_id", routeGuard, (req, res, next) => {
  const id = req.params._id;
  // console.log(id);
  User.findById(id)
  .then(band => {
    res.render(`form/contact-form`, {
      band
    });
  })
  .catch(error => {
    next(error);
  });
});

formRouter.post("/contact-form/:_id", routeGuard, (req, res, next) => {
  const id = req.params._id;
  const userMessage = req.body;
  // console.log(bandId);
  // console.log(userMessage);
  User.findById(id)
  .then(user => {
    sendMailFromForm(userMessage, user);
    // console.log('SENT MAIL TO BAND');
    res.redirect("/form/successful-contact");
    // console.log('USER MESSAGE', userMessage);
    // console.log('BAND', band);
  })
  .catch(error => {
      next(error);
    });
  });
  
  formRouter.get("/successful-contact", routeGuard, (req, res, next) => {
    // console.log('OIIIIIIIIIIIIII');
    res.render("form/successful-contact");
  });

  module.exports = formRouter;
