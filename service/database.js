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
    .find({ 
      $or: [
        { flagged: { $exists: false } }, // Old scores without flagged field
        { flagged: false },              // Explicitly not flagged
        { flagged: { $ne: true } },      // Not flagged (catches null/undefined)
        { reviewStatus: "approve" }      // Approved after being flagged
      ]
    })
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
  // Only return non-flagged scores or approved scores (same logic as leaderboard)
  const userScores = await scoreCollection
    .find({ 
      name: name,
      $or: [
        { flagged: { $exists: false } }, // Old scores without flagged field
        { flagged: false },              // Explicitly not flagged
        { flagged: { $ne: true } },      // Not flagged (catches null/undefined)
        { reviewStatus: "approve" }      // Approved after being flagged
      ]
    })
    .toArray();
  return userScores;
}

// Get recent scores for a user (for statistical analysis)
async function getRecentScores(name, limit = 10) {
  if (!name) return [];
  const recentScores = await scoreCollection
    .find({ name: name })
    .sort({ 
      submittedAt: -1,  // New scores with submittedAt first
      _id: -1           // Fallback to _id for old scores without submittedAt
    })
    .limit(limit)
    .toArray();
  
  // Return just the score values, not the full objects
  return recentScores.map(score => score.score);
}

// Get all flagged scores pending review
async function getFlaggedScores() {
  const flaggedScores = await scoreCollection
    .find({ 
      flagged: true, 
      reviewStatus: "pending" 
    })
    .sort({ submittedAt: -1 }) // Newest first
    .toArray();
  
  return flaggedScores;
}

// Update a score's review status (approve/deny)
async function updateScoreReviewStatus(scoreId, action) {
  const { ObjectId } = require('mongodb');
  
  const updateData = {
    reviewStatus: action,
    reviewedAt: new Date().toISOString()
  };
  
  // If approved, make it appear on leaderboards
  if (action === 'approve') {
    updateData.flagged = false;
  }
  
  return await scoreCollection.updateOne(
    { _id: new ObjectId(scoreId) },
    { $set: updateData }
  );
}

module.exports = {
  getUser,
  getUserByToken,
  addUser,
  updateUser,
  addScore,
  getHighScores,
  getPersonalBest,
  getRecentScores,
  getFlaggedScores,
  updateScoreReviewStatus,
};
