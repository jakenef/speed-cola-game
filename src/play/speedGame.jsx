import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import { delay } from "./delay";

export function SpeedGame({userName}) {
  const [isStarted, setIsStarted] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState("black");


  const handleStart = () => {
    setIsStarted(true);
    setBackgroundImage("url('/static.jpg')"); // Access directly from public folder
    delay(getRandomTime()).then(() => {
      setBackgroundImage("url('/greenGo.jpg')"); // Access directly from public folder
    });
  };

  const getRandomTime = () => {
    return Math.floor(Math.random() * 3000) + 2000; // Random time between 2 and 4 seconds
  };

  return (
    <div>
      <div className="center-group">
        <h1>When the screen says go, click the button!</h1>
        <h5>Tip: Don't click too early, or you'll have to restart.</h5>
        <div className="centered-row" id="score">
          <div className="players">
            Player: {" "}
            <span className="player-name">broken{userName?.split('@')[0]}</span>
          </div>
          <div className="score-count">
            <label for="score-count">-- ms</label>
          </div>
        </div>
      </div>
      <Button className="btn btn-secondary btn-lg" onClick={handleStart} disabled={isStarted} style={{ marginTop: "1rem", marginBottom: "1rem" }}>
        Start
      </Button>
      <div
        className="screen"
        style={{
          width: "200px",
          height: "200px",
          backgroundColor: "black",
          backgroundImage: backgroundImage,
          backgroundSize: "cover",
          backgroundPosition: "center",
          margin: "0 auto",
          borderRadius: "10px",
          marginBottom: "1rem",
        }}
      ></div>
    </div>
  );
}

export default SpeedGame;
