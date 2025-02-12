import React from "react";

export function Leaderboard() {
  return (
    <main class="container-fluid bg-dark text-center">
      <div class="container text-center">
        <div class="row justify-content-center">
          <div class="col-md-6 players">
            Player: {" "}
            <span class="player-name">Mystery player</span>
          </div>
        </div>
        <h3>Your personal best is:</h3>
        <div class="score-count">
          <label for="score-count">-- ms</label>
        </div>
        <h3>
          Beat 5.25 ms to prove you have the Speed-Cola perk in real life!
        </h3>
      </div>
      <table class="table table-light table-striped-columns">
        <thead class="table-light">
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Time (ms)</th>
            <th>Place</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>도윤 이</td>
            <td>1.02</td>
            <td>Temecula, CA</td>
            <td>May 20, 2021</td>
          </tr>
          <tr>
            <td>2</td>
            <td>Annie James</td>
            <td>2.99</td>
            <td>Provo, UT</td>
            <td>June 2, 2021</td>
          </tr>
          <tr>
            <td>3</td>
            <td>Gunter Spears</td>
            <td>7.55</td>
            <td>Reno, NV</td>
            <td>July 3, 2020</td>
          </tr>
        </tbody>
      </table>
    </main>
  );
}
