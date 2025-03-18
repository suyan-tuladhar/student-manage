const bcrypt = require('bcrypt');
const { findUserByIdentifier } = require('../model/userSchema.js');
require('dotenv').config();

async function login(req, res) {
  const { emailOrUsername, password } = req.body;

  if (!emailOrUsername || !password) {
    return res.status(400).json({ error: "Email/Username and Password are required." });
  }

  try {
    const user = await findUserByIdentifier(emailOrUsername);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "Invalid credentials." });
    }
    delete user.password;
    return res.json(user);
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = { login };
