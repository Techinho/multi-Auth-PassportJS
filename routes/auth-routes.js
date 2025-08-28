const express = require("express");
const router = express.Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");
const User = require("../models/user-model");

const JWT_SECRET = process.env.JWT_SECRET;

// ----------------------
// Render login page
// ----------------------
router.get("/login", (req, res) => {
  res.render("login");
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
// Form Login (JWT)
// ----------------------
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log("Login attempt:", { email, passwordLength: password?.length });

  try {
    // Try to find the user first to debug the issue
    const userExists = await User.findOne({ email });
    if (!userExists) {
      console.log("User not found in database for email:", email);
      return res.status(400).json({ error: "Invalid email or password" });
    }

    console.log("User found in database:", {
      id: userExists._id,
      hasPassword: !!userExists.password,
      isGoogleUser: !!userExists.googleId,
      isGithubUser: !!userExists.githubId,
    });

    // Now try to login
    const user = await User.login(email, password);
    const payload = { id: user._id, email: user.email };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
    console.log("Login successful, token generated");
    res.json({ token: "Bearer " + token });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(400).json({ error: err.message });
  }
});

// ----------------------
// Logout
// ----------------------
router.get("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) return next(err);
    res.redirect("/");
  });
});

// ----------------------
// Protected route for JWT auth
// ----------------------
router.get(
  "/profile",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({ msg: "Protected route", user: req.user });
  }
);

// ----------------------
// Google OAuth
// ----------------------
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/redirect",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    // Generate JWT after OAuth login
    const token = jwt.sign(
      { id: req.user._id, email: req.user.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    // Store token in local storage via client-side script
    res.send(`
      <html>
        <body>
          <script>
            localStorage.setItem('token', 'Bearer ${token}');
            window.location.href = '/profile';
          </script>
        </body>
      </html>
    `);
  }
);

// ----------------------
// GitHub OAuth
// ----------------------
router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

router.get(
  "/github/redirect",
  passport.authenticate("github", { session: false }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user._id, email: req.user.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    // Store token in local storage via client-side script
    res.send(`
      <html>
        <body>
          <script>
            localStorage.setItem('token', 'Bearer ${token}');
            window.location.href = '/profile';
          </script>
        </body>
      </html>
    `);
  }
);

module.exports = router;
