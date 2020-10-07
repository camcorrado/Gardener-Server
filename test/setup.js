process.env.JWT_EXPIRY = "3h";
process.env.JWT_SECRET = "test-jwt-secret";
process.env.NODE_ENV = "test";
process.env.TZ = "UCT";

require("dotenv").config();

process.env.TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ||
  "postgresql://dunder_mifflin@localhost/gardener-test";

const { expect } = require("chai");
const supertest = require("supertest");

global.expect = expect;
global.supertest = supertest;
