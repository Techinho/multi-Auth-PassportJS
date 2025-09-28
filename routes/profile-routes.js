// profile-routes.js
const router = require("express").Router();
const passport = require("passport");

// Profile page - let client handle authentication
router.get("/", (req, res) => {
  res.render("profile", { user: null });
});

// Protected profile API endpoint
router.get(
  "/api",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({
      user: {
        id: req.user._id,
        email: req.user.email,
        username: req.user.username,
        thumbnail: req.user.thumbnail,
        googleId: req.user.googleId,
        githubId: req.user.githubId,
      },
    });
  }
);

module.exports = router;
