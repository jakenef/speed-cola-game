require("dotenv").config();
const config = require("./dbConfig.json");
const express = require("express");
const fetch = require("node-fetch");
const app = express();
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const uuid = require("uuid");
const DB = require("./database.js");
const { peerProxy } = require("./peerProxy.js");
const badwordsRegex = require("badwords/regexp");

const port = process.argv.length > 2 ? process.argv[2] : 4000;
const authCookieName = "token";

// Rate limiting for score submissions
const lastSubmissions = new Map();

// Admin users (only these users can access admin endpoints)
const ADMIN_USERS = ['nefguyz']; // Add your username here

app.use(express.static("public"));
app.use(express.json());
app.use(cookieParser());
let apiRouter = express.Router();
app.use(`/api`, apiRouter);

apiRouter.post("/auth/create", async (req, res) => {
  const username = req.body.name;
  if (badwordsRegex.test(username)) {
    return res.status(400).send({ msg: "Inappropriate username" });
  }

  if (await findUser("name", req.body.name)) {
    res.status(409).send({ msg: "Existing user" });
  } else {
    const ip = req.headers["x-forwarded-for"]
      ? req.headers["x-forwarded-for"].split(",")[0].trim()
      : req.ip;
    const user = await createUser(req.body.name, req.body.password, ip);

    setAuthCookie(res, user.token);
    res.send({ name: user.name, ip: ip, location: user.location });
  }
});

apiRouter.post("/auth/login", async (req, res) => {
  const user = await findUser("name", req.body.name);
  if (user) {
    if (await bcrypt.compare(req.body.password, user.password)) {
      user.token = uuid.v4();
      const ip = req.headers["x-forwarded-for"]
        ? req.headers["x-forwarded-for"].split(",")[0].trim()
        : req.ip;
      user.location = await getLocation(ip);
      await DB.updateUser(user);

      setAuthCookie(res, user.token);
      res.send({ name: user.name });
      return;
    }
  }
  res.status(401).send({ msg: "Unauthorized" });
});

apiRouter.delete("/auth/logout", async (req, res) => {
  const user = await findUser("token", req.cookies[authCookieName]);
  if (user) {
    delete user.token;
    await DB.updateUser(user);
  }
  res.clearCookie(authCookieName);
  res.status(204).end();
});

//Middleware to verify if user is auth to an endpoint
const verifyAuth = async (req, res, next) => {
  const user = await findUser("token", req.cookies[authCookieName]);
  if (user) {
    req.user = user;
    next();
  } else {
    res.status(401).send({ msg: "Unauthorized" });
  }
};

//Middleware to verify admin access
const verifyAdmin = async (req, res, next) => {
  const user = await findUser("token", req.cookies[authCookieName]);
  if (user && ADMIN_USERS.includes(user.name)) {
    req.user = user;
    next();
  } else {
    res.status(403).send({ msg: "Admin access required" });
  }
};

apiRouter.get("/scores", verifyAuth, async (_req, res) => {
  const scores = await DB.getHighScores();
  res.send(scores);
});

apiRouter.get("/personal-best/:name", verifyAuth, async (req, res) => {
  const name = req.params.name;
  const personalBest = await DB.getPersonalBest(name);
  return res.json({ personalBest });
});

apiRouter.post("/score", verifyAuth, async (req, res) => {
  try {
    const user = req.user;
    
    // Rate limiting: prevent submissions faster than every 3 seconds
    const now = Date.now();
    const userId = user.name;
    const lastSubmission = lastSubmissions.get(userId);
    
    if (lastSubmission && now - lastSubmission < 3000) {
      return res.status(429).json({ 
        error: "Suspicious activity detected."
      });
    }
    
    lastSubmissions.set(userId, now);
    
    // Statistical analysis for suspicious scores
    const personalBest = await DB.getPersonalBest(user.name);
    const recentScores = await DB.getRecentScores ? await DB.getRecentScores(user.name, 10) : [];
    
    let flagReason = null;
    
    // Flag 1: Impossible improvement (more than 40% better than personal best)
    // Only flag if user has enough games AND personal best is reasonable
    if (personalBest && personalBest < 1000 && recentScores.length >= 2 && req.body.score < personalBest * 0.6) {
      flagReason = `Score ${req.body.score}ms is 40%+ better than personal best ${personalBest}ms`;
    }
    
    // Flag 2: Too good for a new player (under 150ms with less than 5 games)
    if (recentScores.length < 5 && req.body.score < 150) {
      flagReason = `New player (${recentScores.length} games) with expert-level score ${req.body.score}ms`;
    }
    
    // Flag 3: Inconsistent with recent performance
    // Only flag if user has enough games for a reliable average (8+ games)
    if (recentScores.length >= 8) {
      const avgRecent = recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length;
      // More lenient threshold - only flag if 3x better than average (not 2x)
      if (req.body.score < avgRecent * 0.33) {
        flagReason = `Score ${req.body.score}ms much better than recent average ${Math.round(avgRecent)}ms`;
      }
    }
    
    // Add flag info to score data
    if (flagReason) {
      req.body.flagged = true;
      req.body.flagReason = flagReason;
      req.body.reviewStatus = "pending";
      console.warn(`🚩 FLAGGED SCORE: ${user.name} - ${flagReason}`);
    }
    
    req.body.location = user.location;
    req.body.name = user.name;
    req.body.date = new Date().toISOString().split('T')[0]; // UTC date (YYYY-MM-DD)
    req.body.submittedAt = new Date().toISOString(); // Full UTC timestamp
    await DB.updateUser(user);

    const scores = await updateScores(req.body);
    
    // Send back clean response without flagging info
    const cleanResponse = {
      name: req.body.name,
      score: req.body.score,
      date: req.body.date,
      location: req.body.location
    };
    res.send(cleanResponse);
  } catch (err) {
    console.error("/api/score error:", err.message);
    // validation error → 400, everything else → 500
    const status = err.message.includes("Score must be") ? 400 : 500;
    res.status(status).json({ error: err.message });
  }
});

// Admin endpoints for reviewing flagged scores
// How to get flagged score list in browser:
// fetch('/api/admin/flagged-scores', {credentials: 'include'})
//   .then(r => r.json())
//   .then(console.log)
apiRouter.get("/admin/flagged-scores", verifyAdmin, async (req, res) => {
  try {
    const flaggedScores = await DB.getFlaggedScores ? await DB.getFlaggedScores() : [];
    res.json(flaggedScores);
  } catch (err) {
    console.error("Error fetching flagged scores:", err);
    res.status(500).json({ error: "Failed to fetch flagged scores" });
  }
});

// How to approve score in browser:
// fetch('/api/admin/review-score/SCORE_ID_HERE', {
//   method: 'POST',
//   headers: {'Content-Type': 'application/json'},
//   credentials: 'include',
//   body: JSON.stringify({action: 'approve'})
// })
// .then(r => r.json())
// .then(console.log);
apiRouter.post("/admin/review-score/:scoreId", verifyAdmin, async (req, res) => {
  try {
    const { scoreId } = req.params;
    const { action } = req.body; // "approve" or "deny"
    
    if (!["approve", "deny"].includes(action)) {
      return res.status(400).json({ error: "Action must be 'approve' or 'deny'" });
    }
    
    // Update the score's review status
    if (DB.updateScoreReviewStatus) {
      await DB.updateScoreReviewStatus(scoreId, action);
    }
    
    console.log(`📋 Score ${scoreId} ${action === 'approve' ? 'approved' : 'denied'} by admin ${req.user.name}`);
    res.json({ message: `Score ${action === 'approve' ? 'approved' : 'denied'} successfully` });
  } catch (err) {
    console.error("Error reviewing score:", err);
    res.status(500).json({ error: "Failed to review score" });
  }
});

app.use(function (err, req, res, next) {
  res.status(500).send({ type: err.name, message: err.message });
});

app.use((_req, res) => {
  res.sendFile("index.html", { root: "public" });
});

//updates and checks for inclusion in the leaderboard
async function updateScores(newScoreBody) {
  if (!newScoreBody.score || newScoreBody.score <= 0) {
    throw new Error("Score must be greater than 0");
  }
  await DB.addScore(newScoreBody);
  const highScores = await DB.getHighScores();
  return highScores;
}

async function findUser(field, value) {
  if (!value) return null;

  if (field === "token") {
    return await DB.getUserByToken(value);
  }
  return await DB.getUser(value);
}

async function createUser(name, password, ip) {
  const passwordHash = await bcrypt.hash(password, 10);
  const location = await getLocation(ip);

  const user = {
    name: name,
    password: passwordHash,
    token: uuid.v4(),
    location: location,
  };
  await DB.addUser(user);

  return user;
}

// setAuthCookie in the HTTP response
function setAuthCookie(res, authToken) {
  res.cookie(authCookieName, authToken, {
    secure: true,
    httpOnly: true,
    sameSite: "strict",
  });
}

async function getLocation(ip) {
  const ipstackUrl = `http://api.ipstack.com/${ip}?access_key=${config.ipWebAPIkey}`;
  const locationResponse = await fetch(ipstackUrl);
  const locationData = await locationResponse.json();
  if (!locationData.city || !locationData.region_code || !locationData) {
    return "Unknown";
  }
  return `${locationData.city}, ${locationData.region_code}`;
}

const httpService = app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

peerProxy(httpService);
