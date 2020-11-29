const GardensService = {
  getGardenForUser(knex, id) {
    return knex.from("gardens").select("*").where("id", id).first();
  },
  getById(knex, id) {
    return knex.from("gardens").select("*").where("id", id).first();
  },
  insertGarden(knex, newGarden) {
    return knex
      .insert(newGarden)
      .into("gardens")
      .returning("*")
      .then((rows) => {
        return rows[0];
      });
  },
  updateGarden(knex, id, newGardenFields) {
    return knex("gardens").where({ id }).update(newGardenFields);
  },
  serializeGarden(garden) {
    let plantArray = [];
    if (garden.plants) {
      garden.plants.map((plant) => plantArray.push(JSON.parse(plant)));
    }

    return {
      id: garden.id,
      plants: plantArray,
      hardiness_zone: garden.hardiness_zone,
    };
  },
};

module.exports = GardensService;
