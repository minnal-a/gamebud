"use strict";

/** Shared config for application; can be required many places. */

require("dotenv").config();
require("colors");

const SECRET_KEY = process.env.SECRET_KEY || "secret-dev";

const PORT = +process.env.PORT || 3001;

// Socket.IO chat server runs on its own port (see chat.js)
const CHAT_PORT = +process.env.CHAT_PORT || 4000;

// Public URLs the browser uses to reach the API and the React app. Leave them
// unset behind the frontend's nginx proxy (Docker, Kubernetes, tunnels): the
// API URL is then worked out per request (helpers/publicUrl.js) and the
// post-login redirect is relative. Set both when running the React dev server
// and the API on separate ports, e.g. API_URL=http://localhost:3001
// FRONTEND_URL=http://localhost:3000.
const API_URL = process.env.API_URL || "";
const FRONTEND_URL = process.env.FRONTEND_URL || "";

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
console.log("API_URL:".yellow, API_URL || "(from request)");
console.log("FRONTEND_URL:".yellow, FRONTEND_URL || "(same origin)");
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
