require("dotenv").config();
const config = require("./dbConfig.json");
const express = require("express");
const fetch = require("node-fetch");
const app = express();
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const uuid = require("uuid");
const DB = require("./database.js");
const { peerProxy } = require('./peerProxy.js');
const badwordsRegex = require('badwords/regexp');


const port = process.argv.length > 2 ? process.argv[2] : 4000;
const authCookieName = "token";

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
    next();
  } else {
    res.status(401).send({ msg: "Unauthorized" });
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
  const user = await findUser("name", req.body.name);
  if (user) {
    req.body.location = user.location;
    await DB.updateUser(user);
  } else {
    return res.status(404).send({ msg: "User not found" });
  }

  const scores = await updateScores(req.body);
  res.send(req.body);
});

app.use(function (err, req, res, next) {
  res.status(500).send({ type: err.name, message: err.message });
});

app.use((_req, res) => {
  res.sendFile("index.html", { root: "public" });
});

//updates and checks for inclusion in the leaderboard
async function updateScores(newScoreBody) {
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