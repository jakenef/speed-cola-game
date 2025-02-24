import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import { delay } from "./delay";

export function SpeedGame({ userName }) {
  const [isStarted, setIsStarted] = useState(false);
  const [isGreen, setIsGreen] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState("");
  const [greenTimestamp, setGreenTimestamp] = useState(null);
  const [trialCount, setTrialCount] = useState(0);
  const [reactionTimes, setReactionTimes] = useState([]);
  const [finalScore, setFinalScore] = useState(null);

  // Resets the entire game state.
  const resetGame = () => {
    setIsStarted(false);
    setIsGreen(false);
    setBackgroundImage("black");
    setGreenTimestamp(null);
    setTrialCount(0);
    setReactionTimes([]);
    setFinalScore(null);
  };

  // Starts a new trial by showing the static image, then switching to the "green" image after a random delay.
  const startTrial = () => {
    setIsGreen(false);
    setBackgroundImage("url('/static.jpg')");
    delay(getRandomTime()).then(() => {
      setBackgroundImage("url('/greenGo.jpg')");
      setIsGreen(true);
      setGreenTimestamp(Date.now());
    });
  };

  // Called when the Start/Reset button is clicked.
  const handleStartReset = () => {
    // Start a new game.
    console.log("handleStartReset fired");
    setIsStarted(true);
    setTrialCount(0);
    setReactionTimes([]);
    setFinalScore(null);
    startTrial();
  };

  // Returns a random delay between 2000ms and 4000ms.
  const getRandomTime = () => {
    return Math.floor(Math.random() * 2000) + 2000;
  };

  // Called when the user clicks the "React!" button.
  const handleReaction = () => {
    // If clicked too early, alert and reset the game.
    if (!isGreen) {
      alert("Too soon! Restarting the game.");
      resetGame();
      return;
    }

    // Calculate the reaction time.
    const reaction = Date.now() - greenTimestamp;
    const newTrialCount = trialCount + 1;
    setTrialCount(newTrialCount);
    const newReactionTimes = [...reactionTimes, reaction];
    setReactionTimes(newReactionTimes);

    if (newTrialCount >= 3) {
      // Compute the average reaction time.
      const sum = newReactionTimes.reduce((a, b) => a + b, 0);
      const avg = Math.round(sum / newReactionTimes.length);
      setFinalScore(avg);

      // Save the score in localStorage.
      const newScoreEntry = {
        name: userName,
        score: avg,
        date: new Date().toLocaleDateString(),
      };
      const storedScores = localStorage.getItem("timeScores");
      const scoresArray = storedScores ? JSON.parse(storedScores) : [];
      scoresArray.push(newScoreEntry);
      localStorage.setItem("timeScores", JSON.stringify(scoresArray));

      // Update personal best if this score is better.
      const prevBest = localStorage.getItem("personalBest");
      if (!prevBest || avg < Number(prevBest)) {
        localStorage.setItem("personalBest", avg);
      }

      // End the game.
      setIsStarted(false);
      setIsGreen(false);
      setBackgroundImage("url('/gameOverCropped.jpg')");
    } else {
      // Otherwise, start the next trial.
      startTrial();
    }
  };

  return (
    <div>
      <div className="center-group">
        <h1>When the screen says go, click the button!</h1>
        <h5>Tip: Don't click too early, or you'll have to restart.</h5>
        <div className="centered-row" id="score">
          <div className="players">
            Player:{" "}
            <span className="player-name">{userName?.split("@")[0]}</span>
          </div>
          <div className="score-count">
            <label htmlFor="score-count">
              {finalScore !== null ? `${finalScore} ms` : "-- ms"}
            </label>
          </div>
        </div>
      </div>
      <Button
        className="btn btn-secondary btn-lg"
        onClick={handleStartReset}
        style={{ marginTop: "1rem", marginBottom: "1rem" }}
        disabled={isStarted}
      >
        Start
      </Button>
      <div
        className="screen"
        style={backgroundImage ? { backgroundImage: backgroundImage } : {}}
        ></div>
      {isStarted && (
        <Button
          className="btn custom-button btn-lg"
          onClick={handleReaction}
          style={{ marginBottom: "1rem" }}
        >
          React!
        </Button>
      )}
    </div>
  );
}

export default SpeedGame;
