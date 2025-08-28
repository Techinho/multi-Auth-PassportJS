const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: function () {
      return !this.googleId && !this.githubId;
    },
  },
  googleId: {
    type: String,
  },
  githubId: {
    type: String,
  },
  username: String,
  thumbnail: String,
});

//static signup method
userSchema.statics.signup = async (email, password, username) => {
  //validate email
  if (!email || !password) {
    throw Error("Email and password are required");
  }
  if (!validator.isEmail(email)) {
    throw Error("Invalid email");
  }
  if (!validator.isStrongPassword(password)) {
    throw Error("Password not strong enough");
  }
  //check if user already exists
  const exists = await User.findOne({ email });
  if (exists) {
    throw Error("Email already in use");
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  //create new user
  const user = await User.create({
    email,
    password: hash,
    username: username || email.split("@")[0],
  });
  return user;
};

//static login method
userSchema.statics.login = async (email, password) => {
  //validate email
  if (!email || !password) {
    throw Error("Email and password are required");
  }
  
  const user = await User.findOne({ email });
  if (!user) {
    throw Error("Invalid email or password");
  }

  // Check if this user has a password (they might be OAuth user)
  if (!user.password) {
    throw Error("This account uses Google or GitHub login");
  }

  try {
    // Log the first few characters of both password and stored hash for comparison
    console.log("Password debug:", { 
      providedPasswordStart: password.substring(0, 3),
      storedHashStart: user.password.substring(0, 10),
      storedHashLength: user.password.length
    });
    
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password comparison:", { isMatch });
    
    if (!isMatch) {
      throw Error("Invalid email or password");
    }
  } catch (err) {
    console.error("Password comparison error:", err.message);
    throw Error("Invalid email or password");
  }

  return user;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
