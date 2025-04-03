const { MongoClient } = require("mongodb");
const config = require("./dbConfig.json");

const url = `mongodb+srv://${config.userName}:${config.password}@${config.hostname}`;
const client = new MongoClient(url);
const db = client.db("speedCola");
const userCollection = db.collection("user");
const scoreCollection = db.collection("score");

// This will asynchronously test the connection and exit the process if it fails
(async function testConnection() {
  try {
    await db.command({ ping: 1 });
    console.log(`Connect to database`);
  } catch (ex) {
    console.log(
      `Unable to connect to database with ${url} because ${ex.message}`
    );
    process.exit(1);
  }
})();

function getUser(name) {
  return userCollection.findOne({ name: name });
}

function getUserByToken(token) {
  return userCollection.findOne({ token: token });
}

async function addUser(user) {
  await userCollection.insertOne(user);
}

async function updateUser(user) {
  const { _id, ...userWithoutId } = user;
  await userCollection.updateOne({ name: user.name }, { $set: userWithoutId });
}

async function addScore(score) {
  return scoreCollection.insertOne(score);
}

async function getHighScores() {
  const highScores = await scoreCollection
    .find({})
    .sort({ score: 1 })
    .limit(10)
    .toArray();
  return highScores;
}

async function getPersonalBest(name) {
  const scores = await getUserScores(name);
  let personalBest = null;
  if (scores && scores.length > 0) {
    personalBest = Math.min(...scores.map((s) => s.score));
  }

  return personalBest;
}

async function getUserScores(name) {
  if (!name) return [];
  const userScores = await scoreCollection.find({ name: name }).toArray();
  return userScores;
}

module.exports = {
  getUser,
  getUserByToken,
  addUser,
  updateUser,
  addScore,
  getHighScores,
  getPersonalBest,
};
