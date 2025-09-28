const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");
const User = require("../models/user-model");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

// ----------------------
// Serialize / Deserialize (optional, only for session)
// ----------------------
passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// ----------------------
// JWT Strategy
// ----------------------
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: (req) => {
        // Extract JWT from httpOnly cookie
        if (req && req.cookies) {
          return req.cookies.accessToken;
        }
        return null;
      },
      secretOrKey: JWT_SECRET,
    },
    async (payload, done) => {
      try {
        const user = await User.findById(payload.id).select("-password");
        if (user) return done(null, user);
        return done(null, false);
      } catch (err) {
        done(err, false);
      }
    }
  )
);

// ----------------------
// Google Strategy
// ----------------------
passport.use(
  new GoogleStrategy(
    {
      callbackURL: "/auth/google/redirect",
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });
        if (user) return done(null, user);

        user = await User.create({
          googleId: profile.id,
          username: profile.displayName,
          thumbnail: profile._json.picture,
          email: profile._json.email,
        });
        done(null, user);
      } catch (err) {
        done(err, false);
      }
    }
  )
);

// ----------------------
// GitHub Strategy
// ----------------------
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "/auth/github/redirect",
      scope: ["user:email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ githubId: profile.id });
        if (user) return done(null, user);

        // GitHub emails might be private
        const email = profile.emails?.[0]?.value || "";

        user = await User.create({
          githubId: profile.id,
          username: profile.username,
          thumbnail: profile.photos?.[0]?.value || "",
          email,
        });
        done(null, user);
      } catch (err) {
        done(err, false);
      }
    }
  )
);
