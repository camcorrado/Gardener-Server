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

  describe(`GET /api/gardens/:garden_id`, () => {
    context(`Given no gardens`, () => {
      beforeEach(() => helpers.seedUsers(db, testUsers));

      it(`responds with 404`, () => {
        const gardenId = 123456;
        return supertest(app)
          .get(`/api/gardens/${gardenId}`)
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
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
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .expect(200, expectedGarden);
      });
    });
  });

  describe(`POST /api/gardens`, () => {
    beforeEach("insert users", () => helpers.seedUsers(db, testUsers));

    it(`creates a garden, responding with 201 and the new garden`, function () {
      const testUser = testUsers[0];
      const newGarden = {
        user_id: testUser.id,
        plants: ["Plant 1", "Plant 2"],
        zipcode: 66666,
      };
      return supertest(app)
        .post("/api/gardens")
        .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
        .send(newGarden)
        .expect(201)
        .expect((res) => {
          expect(res.body).to.have.property("id");
          expect(res.body.user_id).to.eql(newGarden.user_id);
          expect(res.body.plants).to.eql(newGarden.plants);
          expect(res.body.zipcode).to.eql(newGarden.zipcode);
        })
        .expect((res) =>
          db
            .from("gardens")
            .select("*")
            .where({ id: res.body.id })
            .first()
            .then((row) => {
              expect(row.user_id).to.eql(newGarden.user_id);
              expect(row.plants).to.eql(newGarden.plants);
              expect(row.zipcode).to.eql(newGarden.zipcode);
            })
        );
    });

    const requiredFields = ["plants", "zipcode"];

    requiredFields.forEach((field) => {
      const newGarden = {
        plants: ["test plants"],
        zipcode: 666666,
        ...testGardens[0],
      };

      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newGarden[field];
        return supertest(app)
          .post("/api/gardens")
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .send(newGarden)
          .expect(400, {
            error: `Missing '${field}' in request body`,
          });
      });
    });
  });

  describe(`PATCH /api/gardens/:garden_id`, () => {
    context("Given there are gardens in the database", () => {
      beforeEach("insert gardens", () =>
        helpers.seedGardens(db, testUsers, testGardens)
      );

      const requiredFields = ["plants", "zipcode"];

      requiredFields.forEach((field) => {
        const registerAttemptBody = {
          plants: ["test patch plants"],
          zipcode: 99999,
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
          plants: ["updated plants"],
          zipcode: 77777,
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
          zipcode: 88888,
        };

        const expectedGarden = {
          ...testGardens[1],
          ...updatedGarden,
        };
        return supertest(app)
          .patch(`/api/gardens/${idToUpdate}`)
          .set("Authorization", helpers.makeAuthHeader(testUsers[1]))
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
