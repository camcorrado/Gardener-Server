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
      id: 1,
      user_id: users[0].id,
      plants: ["plant 1", "plant 2"],
      zipcode: 11111,
    },
    {
      id: 2,
      user_id: users[1].id,
      plants: ["plant 3", "plant 4"],
      zipcode: 22222,
    },
    {
      id: 3,
      user_id: users[2].id,
      plants: ["plant 5", "plant 6"],
      zipcode: 33333,
    },
    {
      id: 4,
      user_id: users[3].id,
      plants: ["plant 7", "plant 8"],
      zipcode: 44444,
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
    await trx.raw(`SELECT setval('gardens_id_seq', ?)`, [
      gardens[gardens.length - 1].id,
    ]);
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
    user_id: garden.user_id,
    plants: garden.plants,
    zipcode: garden.zipcode,
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
