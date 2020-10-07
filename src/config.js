module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || "development",
  JWT_SECRET: process.env.JWT_SECRET || "",
  JWT_EXPIRY: process.env.JWT_EXPIRY || "3h",
  DATABASE_URL:
    process.env.DATABASE_URL ||
    "postgresql://dunder_mifflin@localhost/gardener",
  TEST_DATABASE_URL:
    process.env.TEST_DATABASE_URL ||
    "postgresql://dunder_mifflin@localhost/gardener-test",
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || "http://localhost:3000",
};
