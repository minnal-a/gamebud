"use strict";
/** Database setup for jobly. */
const { Client } = require("pg");
const { getDatabaseUri } = require("./config");

let db;

// SSL defaults on in production (hosted Postgres); DATABASE_SSL=false turns it
// off, e.g. for the Postgres container in docker-compose.
const useSsl = process.env.DATABASE_SSL
    ? process.env.DATABASE_SSL === "true"
    : process.env.NODE_ENV === "production";

if (useSsl) {
  db = new Client({
    connectionString: getDatabaseUri(),
    ssl: {
      rejectUnauthorized: false
    }
  });
} else {
  db = new Client({
    connectionString: getDatabaseUri()
  });
}
db.connect();

module.exports = db;