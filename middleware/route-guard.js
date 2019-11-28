module.exports = (req, res, next) => {
    if (req.user) {
      next();
    } else {
      next(new Error(`You don't have permission to visit that page.`));
    }
  };