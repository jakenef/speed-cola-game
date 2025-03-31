import React from "react";

export function Leaderboard({ userName }) {
  const [timeScores, setTimeScores] = React.useState([]);
  const [personalBest, setPersonalBest] = React.useState("-- ms");

  React.useEffect(() => {
    fetch('/api/scores')
      .then((response) => response.json())
      .then((timeScoresRes) => {
        if (timeScoresRes) {
          timeScoresRes.sort((a, b) => a.score - b.score);
        }
        setTimeScores(timeScoresRes || []);
      });
    
    fetch(`api/personal-best/${userName}`)
      .then((res) => res.json())
      .then((data) => setPersonalBest(data.personalBest))
      .catch((error) => console.error("Error fetching personal best:", error));
  }, []);

  const scoreRows = [];
  if (timeScores.length) {
    for (const [i, timeScore] of timeScores.entries()) {
      scoreRows.push(
        <tr key={i}>
          <td>{i + 1}</td>
          <td>{timeScore.name}</td>
          <td>{timeScore.score} ms</td>
          <td className="hide-on-small">{timeScore.date}</td>
          <td>{timeScore.location}</td>
        </tr>
      );
    }
  } else {
    scoreRows.push(
      <tr key="0">
        <td colSpan="5">Be the first to score!</td>
      </tr>
    );
  }

  return (
    <main className="container-fluid bg-dark text-center">
      <div className="container text-center">
        <div className="row justify-content-center">
          <div className="col-md-6 players">
            Player:{" "}
            <span className="player-name">{userName}</span>
          </div>
        </div>
        <h3>Your personal best is:</h3>
        <div className="score-count">
          <label htmlFor="score-count">{personalBest || "--"}{" ms"}</label>
        </div>
        <h3 style={{ marginTop: "1rem" }}>
          Beat 325 ms to prove you have the Speed-Cola perk in real life!
        </h3>
      </div>
      <table className="table table-dark table-borderless table-striped not-too-wide">
        <thead className="table-dark table-borderless not-too-wide">
          <tr>
            <th><i>#</i></th>
            <th><i>Name</i></th>
            <th><i>Time (ms)</i></th>
            <th className="hide-on-small"><i>Date</i></th>
            <th><i>Location</i></th>
          </tr>
        </thead>
        <tbody id="scores">{scoreRows}</tbody>
      </table>
    </main>
  );
}
