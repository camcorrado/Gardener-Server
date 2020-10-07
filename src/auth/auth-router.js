const AuthService = require("./auth-service");
const express = require("express");
const { requireAuth } = require("../middleware/jwt-auth");

const authRouter = express.Router();

authRouter.post("/login", (req, res, next) => {
  const { email, password } = req.body;
  const loginUser = { email, password };

  for (const [key, value] of Object.entries(loginUser)) {
    if (value == null) {
      return res
        .status(400)
        .json({ error: `Missing '${key}' in request body` });
    }
  }

  AuthService.getUserWithEmail(req.app.get("db"), loginUser.email)
    .then((dbUser) => {
      if (!dbUser) {
        return res.status(400).json({ error: "Incorrect email or password" });
      }

      return AuthService.comparePasswords(
        loginUser.password,
        dbUser.password
      ).then((compareMatch) => {
        if (!compareMatch) {
          return res.status(400).json({ error: "Incorrect email or password" });
        }

        const payload = { user_id: dbUser.id };
        const sub = dbUser.email;

        res.send({ authToken: AuthService.createJWT(sub, payload) });
      });
    })
    .catch(next);
});

authRouter.post("/refresh", requireAuth, (req, res) => {
  const sub = req.user.email;
  const payload = { user_id: req.user.id };
  res.send({ authToken: AuthService.createJWT(sub, payload) });
});

module.exports = authRouter;
