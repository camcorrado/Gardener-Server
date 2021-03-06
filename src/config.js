module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || "development",
  JWT_SECRET:
    process.env.JWT_SECRET ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJpYXQiOjE2MDIxMDI2NjEsImV4cCI6MTYwMjExMzQ2MSwic3ViIjoiVFUxQGdtYWlsLmNvbSJ9.CDi90HD9IszQYCOCayeK1aSnzQf6_0kDebkg3FMAu9g",
  JWT_EXPIRY: process.env.JWT_EXPIRY || "3h",
  DATABASE_URL:
    process.env.DATABASE_URL ||
    "postgresql://dunder_mifflin@localhost/gardener",
  TEST_DATABASE_URL:
    process.env.TEST_DATABASE_URL ||
    "postgresql://dunder_mifflin@localhost/gardener-test",
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || "http://localhost:3000",
};
