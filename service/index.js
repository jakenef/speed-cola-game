require("dotenv").config();
console.log(process.env.IPSTACK_ACCESS_KEY);
const ipAccessKey = process.env.IPSTACK_ACCESS_KEY;
const express = require("express");
const fetch = require("node-fetch");
const app = express();
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const uuid = require("uuid");

const port = process.argv.length > 2 ? process.argv[2] : 4000;
const authCookieName = "token";
let users = [];
let scores = [];

app.use(express.json());
app.use(cookieParser());
let apiRouter = express.Router();
app.use(`/api`, apiRouter);
app.use(express.static("public"));

apiRouter.post("/auth/create", async (req, res) => {
  if (await findUser("email", req.body.email)) {
    res.status(409).send({ msg: "Existing user" });
  } else {
    const ip = req.headers["x-forwarded-for"]
      ? req.headers["x-forwarded-for"].split(",")[0].trim()
      : req.ip;
    const user = await createUser(req.body.email, req.body.password, ip);

    setAuthCookie(res, user.token);
    res.send({ email: user.email, ip: ip, location: user.location });
  }
});

apiRouter.post("/auth/login", async (req, res) => {
  const user = await findUser("email", req.body.email);
  if (user) {
    if (await bcrypt.compare(req.body.password, user.password)) {
      user.token = uuid.v4();
      const ip = req.headers["x-forwarded-for"]
        ? req.headers["x-forwarded-for"].split(",")[0].trim()
        : req.ip;
      user.location = getLocation(ip);

      setAuthCookie(res, user.token);
      res.send({ email: user.email });
      return;
    }
  }
  res.status(401).send({ msg: "Unauthorized" });
});

apiRouter.delete("/auth/logout", async (req, res) => {
  const user = await findUser("token", req.cookies[authCookieName]);
  if (user) {
    delete user.token;
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

apiRouter.get("/scores", verifyAuth, (_req, res) => {
  res.send(scores);
});

apiRouter.get("/personal-best/:email", verifyAuth, async (req, res) => {
  const email = req.params.email;
  const scores = await getUserScores(email);
  let personalBest = null;
  if (scores && scores.length > 0) {
    personalBest = Math.min(...scores.map((s) => s.score));
  }
  res.json({ personalBest });
});

apiRouter.post("/score", verifyAuth, async (req, res) => {
  const user = await findUser("email", req.body.name);
  if (user) {
    req.body.location = user.location;
  } else {
    return res.status(404).send({ msg: "User not found" });
  }

  scores = updateScores(req.body);
  res.send(scores);
});

app.use(function (err, req, res, next) {
  res.status(500).send({ type: err.name, message: err.message });
});

app.use((_req, res) => {
  res.sendFile("index.html", { root: "public" });
});

//updates and checks for inclusion in the leaderboard
function updateScores(newScoreBody) {
  let found = false;
  for (const [i, prevScore] of scores.entries()) {
    if (newScoreBody.score < prevScore.score) {
      scores.splice(i, 0, newScoreBody);
      found = true;
      break;
    }
  }

  if (!found) {
    scores.push(newScoreBody);
  }

  if (scores.length > 10) {
    scores.length = 10;
  }

  return scores;
}

function getUserScores(email) {
  if (!email) return [];
  return scores.filter((s) => s.name === email);
}

async function findUser(field, value) {
  if (!value) return null;

  return users.find((u) => u[field] === value);
}

async function createUser(email, password, ip) {
  const passwordHash = await bcrypt.hash(password, 10);
  const location = await getLocation(ip);

  const user = {
    email: email,
    password: passwordHash,
    token: uuid.v4(),
    location: location,
  };
  users.push(user);

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
  console.log("IP in getLocation: ", ip);

  const ipstackUrl = `http://api.ipstack.com/${ip}?access_key=${ipAccessKey}`;
  const locationResponse = await fetch(ipstackUrl);
  const locationData = await locationResponse.json();
  console.log(locationData);
  if (!locationData.city || !locationData.region_code) {
    return "Unknown";
  }
  return `${locationData.city}, ${locationData.region_code}`;
}

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
