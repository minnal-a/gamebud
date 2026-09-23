"use strict";

/** Shared config for application; can be required many places. */

require("dotenv").config();
require("colors");

const SECRET_KEY = process.env.SECRET_KEY || "secret-dev";

const PORT = +process.env.PORT || 3001;

// Socket.IO chat server runs on its own port (see chat.js)
const CHAT_PORT = +process.env.CHAT_PORT || 4000;

// Public URLs the browser uses to reach the API and the React app
const API_URL = process.env.API_URL || `http://localhost:${PORT}`;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

const STEAM_API_KEY = process.env.STEAM_API_KEY || "";

// Use dev dataW2Q1 , testing database, or via env var, production database
function getDatabaseUri() {
  return (process.env.NODE_ENV === "test")
      ? "gb_test"
      : process.env.DATABASE_URL || "gamebuddy";
}

// Speed up bcrypt during tests, since the algorithm safety isn't being tested
//
// WJB: Evaluate in 2021 if this should be increased to 13 for non-test use
const BCRYPT_WORK_FACTOR = process.env.NODE_ENV === "test" ? 1 : 12;

console.log("GameBuddy Config:".green);
console.log("SECRET_KEY:".yellow, SECRET_KEY);
console.log("PORT:".yellow, PORT.toString());
console.log("CHAT_PORT:".yellow, CHAT_PORT.toString());
console.log("API_URL:".yellow, API_URL);
console.log("FRONTEND_URL:".yellow, FRONTEND_URL);
if (!STEAM_API_KEY) console.log("STEAM_API_KEY is not set; Steam login will fail".red);
console.log("BCRYPT_WORK_FACTOR".yellow, BCRYPT_WORK_FACTOR);
console.log("Database:".yellow, getDatabaseUri());
console.log("---");

module.exports = {
  SECRET_KEY,
  PORT,
  CHAT_PORT,
  API_URL,
  FRONTEND_URL,
  STEAM_API_KEY,
  BCRYPT_WORK_FACTOR,
  getDatabaseUri,
};
