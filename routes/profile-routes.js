const router = require("express").Router();
const passport = require("passport");

// Extract token from request
const extractToken = (req) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.split(" ")[0] === "Bearer"
  ) {
    return req.headers.authorization.split(" ")[1];
  } else if (req.query && req.query.token) {
    return req.query.token;
  }
  return null;
};

// Custom middleware to check for JWT in request
const checkJwt = (req, res, next) => {
  // Check if there's a JWT in the authorization header
  const token = extractToken(req);

  if (token) {
    // Use passport JWT strategy
    passport.authenticate("jwt", { session: false })(req, res, next);
  } else if (req.isAuthenticated()) {
    // If no JWT but session is authenticated, proceed
    next();
  } else {
    // Neither JWT nor session auth
    res.redirect("/auth/login");
  }
};

// Profile route that works with both session and JWT
router.get("/", checkJwt, (req, res) => {
  res.render("profile", { user: req.user });
});

module.exports = router;
