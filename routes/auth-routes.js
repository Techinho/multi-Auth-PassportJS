// auth-routes.js
const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user-model");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashToken,
  compareToken,
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
} = require("../utils/jwtUtils");

// ----------------------
// Render login page
// ----------------------
router.get("/login", (req, res) => {
  const error = req.query.error;
  const message = error ? { type: "error", text: error } : null;
  res.render("login", { message });
});

// ----------------------
// Form Register
// ----------------------
router.get("/register", (req, res) => {
  res.render("register");
});

router.post("/register", async (req, res) => {
  const { email, password, username } = req.body;
  console.log("Register attempt:", {
    email,
    username,
    passwordLength: password?.length,
  });

  try {
    const user = await User.signup(email, password, username);
    console.log("User registered successfully:", {
      id: user._id,
      email: user.email,
    });
    res.status(201).json({ msg: "User registered", userId: user._id });
  } catch (err) {
    console.error("Registration error:", err.message);
    res.status(400).json({ error: err.message });
  }
});

// ----------------------
// Form Login (with httpOnly cookies)
// ----------------------
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log("Login attempt:", { email, passwordLength: password?.length });

  try {
    const user = await User.login(email, password);

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store hashed refresh token in database
    user.refreshToken = await hashToken(refreshToken);
    await user.save();

    // Set httpOnly cookies
    res.cookie("accessToken", accessToken, accessTokenCookieOptions);
    res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);

    console.log("Login successful, cookies set");

    // Redirect to profile page
    res.redirect("/profile");
  } catch (err) {
    console.error("Login error:", err.message);
    // Redirect back to login with error message
    res.redirect("/auth/login?error=" + encodeURIComponent(err.message));
  }
});

// ----------------------
// Refresh Token Endpoint (only accepts refresh token via cookie)
// ----------------------
router.post("/refresh-token", async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ error: "Refresh token required" });
  }

  try {
    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Find user
    const user = await User.findById(decoded.id);
    if (!user || !user.refreshToken) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    // Verify stored refresh token
    const isValid = await compareToken(refreshToken, user.refreshToken);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // Update stored refresh token
    user.refreshToken = await hashToken(newRefreshToken);
    await user.save();

    // Set new httpOnly cookies
    res.cookie("accessToken", newAccessToken, accessTokenCookieOptions);
    res.cookie("refreshToken", newRefreshToken, refreshTokenCookieOptions);

    res.json({
      success: true,
      message: "Tokens refreshed successfully",
    });
  } catch (error) {
    console.error("Token refresh error:", error.message);

    // Clear invalid tokens
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.status(401).json({ error: "Invalid refresh token" });
  }
});

// ----------------------
// Logout
// ----------------------
router.post(
  "/logout",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      // Clear refresh token from database
      if (req.user) {
        req.user.refreshToken = null;
        await req.user.save();
      }

      // Clear cookies
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");

      res.json({ success: true, message: "Logged out successfully" });
    } catch (error) {
      console.error("Logout error:", error.message);
      res.status(500).json({ error: "Server error during logout" });
    }
  }
);

// ----------------------
// Get current user (for client-side)
// ----------------------
router.get(
  "/me",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({
      user: {
        id: req.user._id,
        email: req.user.email,
        username: req.user.username,
        thumbnail: req.user.thumbnail,
      },
    });
  }
);

// ----------------------
// Protected route for JWT auth
// ----------------------
router.get(
  "/profile",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({
      msg: "Protected route",
      user: {
        id: req.user._id,
        email: req.user.email,
        username: req.user.username,
        thumbnail: req.user.thumbnail,
      },
    });
  }
);

// ----------------------
// Google OAuth with httpOnly cookies
// ----------------------
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/redirect",
  passport.authenticate("google", { session: false }),
  async (req, res) => {
    try {
      // Generate tokens after OAuth login
      const accessToken = generateAccessToken(req.user);
      const refreshToken = generateRefreshToken(req.user);

      // Store refresh token in database
      req.user.refreshToken = await hashToken(refreshToken);
      await req.user.save();

      // Set httpOnly cookies
      res.cookie("accessToken", accessToken, accessTokenCookieOptions);
      res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);

      // Redirect to profile
      res.redirect("/profile");
    } catch (error) {
      console.error("Google OAuth error:", error);
      res.redirect("/auth/login?error=oauth_failed");
    }
  }
);

// ----------------------
// GitHub OAuth with httpOnly cookies
// ----------------------
router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

router.get(
  "/github/redirect",
  passport.authenticate("github", { session: false }),
  async (req, res) => {
    try {
      // Generate tokens after OAuth login
      const accessToken = generateAccessToken(req.user);
      const refreshToken = generateRefreshToken(req.user);

      // Store refresh token in database
      req.user.refreshToken = await hashToken(refreshToken);
      await req.user.save();

      // Set httpOnly cookies
      res.cookie("accessToken", accessToken, accessTokenCookieOptions);
      res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);

      // Redirect to profile
      res.redirect("/profile");
    } catch (error) {
      console.error("GitHub OAuth error:", error);
      res.redirect("/auth/login?error=oauth_failed");
    }
  }
);

module.exports = router;
