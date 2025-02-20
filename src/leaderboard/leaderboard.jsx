import React from "react";

export function Leaderboard({ userName }) {

  const [timeScores, setTimeScores] = React.useState([]);
  React.useEffect(() => {
    const timeScoresText = localStorage.getItem('timeScores');
    if (timeScoresText) {
      setTimeScores(JSON.parse(timeScoresText));
    }
  }, []);

  const scoreRows = [];
  if (timeScores.length) {
    for (const [i, timeScore] of timeScores.entries()) {
      scoreRows.push(
        <tr key={i}>
          <td>{i}</td>
          <td>{timeScore.name.split('@')[0]}</td>
          <td>{timeScore.score}</td>
          <td>{timeScore.date}</td>
        </tr>
      );
    }
  } else {
    scoreRows.push(
      <tr key='0'>
        <td colSpan='5'>Be the first to score!</td>
      </tr>
    );
  }

  return (
    <main class="container-fluid bg-dark text-center">
      <div class="container text-center">
        <div class="row justify-content-center">
          <div class="col-md-6 players">
            Player: {" "}
            <span class="player-name">{userName?.split('@')[0]}</span>
          </div>
        </div>
        <h3>Your personal best is:</h3>
        <div class="score-count">
          <label for="score-count">-- ms</label>
        </div>
        <h3>
          Beat 300 ms to prove you have the Speed-Cola perk in real life!
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
        <tbody id='scores'>{scoreRows}</tbody>
      </table>
    </main>
  );
}
