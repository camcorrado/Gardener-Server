const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

function makeFixtures() {
  const testUsers = makeUsersArray();
  const testGardens = makeGardensArray(testUsers);
  return { testUsers, testGardens };
}

function makeUsersArray() {
  return [
    {
      id: 1,
      full_name: "Test user 1",
      email: "TU1@gmail.com",
      password: "Password1!",
    },
    {
      id: 2,
      full_name: "Test user 2",
      email: "TU2@gmail.com",
      password: "Password2!",
    },
    {
      id: 3,
      full_name: "Test user 3",
      email: "TU3@gmail.com",
      password: "Password3!",
    },
    {
      id: 4,
      full_name: "Test user 4",
      email: "TU4@gmail.com",
      password: "Password4!",
    },
  ];
}

function makeGardensArray(users) {
  return [
    {
      id: users[0].id,
      plants: [{ name: "plant 1" }, { name: "plant 2" }],
      hardiness_zone: "1",
    },
    {
      id: users[1].id,
      plants: [{ name: "plant 3" }, { name: "plant 4" }],
      hardiness_zone: "2",
    },
    {
      id: users[2].id,
      plants: [{ name: "plant 5" }, { name: "plant 6" }],
      hardiness_zone: "3",
    },
    {
      id: users[3].id,
      plants: [{ name: "plant 7" }, { name: "plant 8" }],
      hardiness_zone: "4",
    },
  ];
}

function cleanTables(db) {
  return db.transaction((trx) =>
    trx.raw(
      `TRUNCATE
                users,
                gardens
            `
    )
  );
}

function seedUsers(db, users) {
  const preppedUsers = users.map((user) => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1),
  }));
  return db
    .into("users")
    .insert(preppedUsers)
    .then(() =>
      db.raw(`SELECT setval('users_id_seq', ?)`, [users[users.length - 1].id])
    );
}

function seedGardens(db, users, gardens) {
  return db.transaction(async (trx) => {
    await seedUsers(trx, users);
    await trx.into("gardens").insert(gardens);
  });
}

function makeExpectedUser(user) {
  return {
    id: user.id,
    full_name: user.full_name,
    email: user.email,
  };
}

function makeExpectedGarden(garden) {
  return {
    id: garden.id,
    plants: garden.plants,
    hardiness_zone: garden.hardiness_zone,
  };
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.id }, secret, {
    subject: user.email,
    algorithm: "HS256",
  });
  return `Bearer ${token}`;
}

module.exports = {
  makeUsersArray,
  makeFixtures,
  cleanTables,
  seedUsers,
  makeAuthHeader,
  seedGardens,
  makeGardensArray,
  makeExpectedUser,
  makeExpectedGarden,
};
