const GardensService = {
  getGardenForUser(knex, id) {
    return knex.from("gardens").select("*").where("user_id", id).first();
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
    return {
      id: garden.id,
      user_id: garden.user_id,
      plants: garden.plants,
      zipcode: garden.zipcode,
    };
  },
};

module.exports = GardensService;
