import React from "react";

export function Play() {
  return (
    <main class="container-fluid bg-dark text-center">
      <div class="center-group">
        <h1>When the screen shows an icon, click that one.</h1>
        <h5>Tip: Don't click too early, or you'll have to restart.</h5>
        <div class="centered-row" id="score">
          <div class="players">
            Player: {" "}
            <span class="player-name">Mystery player</span>
          </div>
          <div class="score-count">
            <label for="score-count">-- ms</label>
          </div>
        </div>
        <button type="button" class="btn btn-secondary btn-lg">
          Start Game
        </button>
      </div>

      <img class="screen" src="ingameIcon.ico" alt="random" />

      <div id="buttons">
        <button type="button" class="btn btn-secondary btn-lg me-1" disabled>
          🚘
        </button>
        <button type="button" class="btn btn-secondary btn-lg me-1" disabled>
          🌼
        </button>
        <button type="button" class="btn btn-secondary btn-lg me-1" disabled>
          🍏
        </button>
      </div>
      <div id="player-messages">
        <div class="event">
          <span class="player-event">lucyLoo44</span> got a time of{" "}
          <b>17.3 ms!</b>
        </div>
        <div class="event">
          <span class="player-event">Jonohere2</span> got a time of{" "}
          <b>3.34 ms!</b>
        </div>
        <div class="event">
          <span class="system-event">game</span> connected
        </div>
      </div>
    </main>
  );
}
