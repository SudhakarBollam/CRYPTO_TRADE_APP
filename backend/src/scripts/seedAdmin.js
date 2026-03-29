/**
 * Create or promote an admin user (set env ADMIN_EMAIL, ADMIN_PASSWORD).
 * Usage: node src/scripts/seedAdmin.js
 */
require("dotenv").config();
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const { loadConfig } = require("../config");
const User = require("../models/User");

async function main() {
  const { mongoUri, bcryptSaltRounds } = loadConfig();
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD in .env");
    process.exit(1);
  }
  const normalized = email.toLowerCase().trim();
  await mongoose.connect(mongoUri);
  const passwordHash = await bcrypt.hash(password, bcryptSaltRounds);
  let user = await User.findOne({ email: normalized }).select("+passwordHash");
  if (!user) {
    user = await User.create({
      email: normalized,
      passwordHash,
      name: "Admin",
      role: "admin",
    });
  } else {
    user.passwordHash = passwordHash;
    user.role = "admin";
    await user.save();
  }
  console.log("Admin ready:", user.email, user.role);
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
