const app = require("../src/app");
const helpers = require("./test-helpers");
const knex = require("knex");

describe("Gardens Endpoints", function () {
  let db;

  const { testUsers, testGardens } = helpers.makeFixtures();

  before("make knex instance", () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DATABASE_URL,
    });
    app.set("db", db);
  });

  after("disconnect from db", () => db.destroy());

  before("cleanup", () => helpers.cleanTables(db));

  afterEach("cleanup", () => helpers.cleanTables(db));

  describe(`POST /api/gardens`, () => {
    beforeEach("insert users", () => helpers.seedUsers(db, testUsers));

    it(`creates a garden, responding with 201 and the new garden`, function () {
      return supertest(app)
        .post("/api/gardens")
        .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
        .expect(201)
        .expect((res) => {
          expect(res.body).to.have.property("id");
          expect(res.body).to.have.property("hardiness_zone");
          expect(res.body).to.have.property("plants");
        })
        .expect((res) =>
          db.from("gardens").select("*").where({ id: res.body.id }).first()
        );
    });
  });

  describe(`GET /api/gardens/:garden_id`, () => {
    context(`Given no gardens`, () => {
      beforeEach(() => helpers.seedUsers(db, testUsers));

      it(`responds with 404`, () => {
        const gardenId = 123456;
        return supertest(app)
          .get(`/api/gardens/${gardenId}`)
          .expect(404, { error: `Garden doesn't exist` });
      });
    });

    context("Given there are gardens in the database", () => {
      beforeEach("insert gardens", () =>
        helpers.seedGardens(db, testUsers, testGardens)
      );

      it("responds with 200 and the specified garden", () => {
        const gardenId = 2;
        const expectedGarden = helpers.makeExpectedGarden(
          testGardens[gardenId - 1]
        );
        return supertest(app)
          .get(`/api/gardens/${gardenId}`)
          .expect(200, expectedGarden);
      });
    });
  });

  describe(`PATCH /api/gardens/:garden_id`, () => {
    context("Given there are gardens in the database", () => {
      beforeEach("insert gardens", () =>
        helpers.seedGardens(db, testUsers, testGardens)
      );

      const requiredFields = ["plants", "hardiness_zone"];

      requiredFields.forEach((field) => {
        const registerAttemptBody = {
          plants: [{ nme: "plant test" }],
          hardiness_zone: "7b",
          ...testGardens[0],
        };
        it(`responds with 400 required error when '${field}' is missing`, () => {
          delete registerAttemptBody[field];

          return supertest(app)
            .patch(`/api/gardens/1`)
            .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
            .send(registerAttemptBody)
            .expect(400, { error: `Missing '${field}' in request body` });
        });
      });

      it("responds with 204 and updates the garden", () => {
        const idToUpdate = 1;
        const updatedGarden = {
          plants: [
            { name: "updated plant test" },
            { name: "updated plant test 2" },
          ],
          hardiness_zone: "8",
        };

        const expectedGarden = {
          ...testGardens[idToUpdate - 1],
          ...updatedGarden,
        };
        return supertest(app)
          .patch(`/api/gardens/${idToUpdate}`)
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .send(updatedGarden)
          .expect(204)
          .then((res) =>
            supertest(app)
              .get(`/api/gardens/${idToUpdate}`)
              .expect(expectedGarden)
          );
      });

      it(`responds with 204 when updating only a subset of fields`, () => {
        const idToUpdate = 1;
        const updatedGarden = {
          ...testGardens[0],
          hardiness_zone: "9",
        };

        const expectedGarden = {
          ...testGardens[1],
          ...updatedGarden,
        };

        return supertest(app)
          .patch(`/api/gardens/${idToUpdate}`)
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .send({
            ...updatedGarden,
            fieldToIgnore: "should not be in GET response",
          })
          .expect(204)
          .then((res) =>
            supertest(app)
              .get(`/api/gardens/${idToUpdate}`)
              .expect(expectedGarden)
          );
      });
    });
  });
});
