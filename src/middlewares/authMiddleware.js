// src/middlewares/authMiddleware.js

export const isLoggedIn = (req, res, next) => {
  if (req.session.user) {
    return next();
  }
  req.flash("error_msg", "Please log in to view that resource");
  res.redirect("/login");
};

export const isAdmin = (req, res, next) => {
  // We'll implement this in v0.7
  next();
};
