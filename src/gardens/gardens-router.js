const express = require("express");
const path = require("path");
const GardensService = require("./gardens-service");
const { requireAuth } = require("../middleware/jwt-auth");

const gardensRouter = express.Router();

gardensRouter.route("/").post(requireAuth, (req, res, next) => {
  const newGarden = {};

  newGarden.id = req.user.id;

  GardensService.insertGarden(req.app.get("db"), newGarden)
    .then((garden) => {
      res
        .status(201)
        .location(path.posix.join(req.originalUrl, `/${garden.id}`))
        .json(GardensService.serializeGarden(garden));
    })
    .catch(next);
});

gardensRouter
  .route("/:garden_id")
  .all(checkGardenExists)
  .get((req, res) => {
    res.json(GardensService.serializeGarden(res.garden));
  })
  .patch(requireAuth, (req, res, next) => {
    let updatedGarden = {};
    const { plants, hardiness_zone } = req.body;

    if (plants) {
      updatedGarden.plants = plants;
    } else {
      return res
        .status(400)
        .json({ error: `Missing 'plants' in request body` });
    }

    if (hardiness_zone) {
      updatedGarden.hardiness_zone = hardiness_zone;
    } else {
      return res
        .status(400)
        .json({ error: `Missing 'hardiness_zone' in request body` });
    }

    GardensService.updateGarden(
      req.app.get("db"),
      req.params.garden_id,
      updatedGarden
    )
      .then(() => res.status(204).end())
      .catch(next);
  });

async function checkGardenExists(req, res, next) {
  try {
    const garden = await GardensService.getById(
      req.app.get("db"),
      req.params.garden_id
    );

    if (!garden) {
      return res.status(404).json({ error: `Garden doesn't exist` });
    }

    res.garden = garden;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = gardensRouter;
