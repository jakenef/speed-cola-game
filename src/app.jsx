import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';

export default function App() {
  return (
    <div>
        <header className="bg-dark text-light">
        <nav className="navbar navbar-dark navbar-expand-lg bg-dark">
          <div className="container-fluid">
            <a className="navbar-brand" href="index.html">
              <img src="ingameIcon.ico" width="30"></img> The Speed-Cola Click Test
            </a>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav">
                <li className="nav-item">
                  <a className="nav-link" href="index.html">Home</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link active" aria-current="page" href="play.html">Play</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="leaderboard.html">Leaderboard</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="about.html">About</a>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </header>

      <div classNameName='body bg-dark text-light'>App will display here</div>

      <footer className="bg-dark text-white-50">
        <div className="container-fluid">
          <span className="text-reset">Jacob Nef</span>
          <a className="text-reset ms-3" href="https://github.com/jakenef/startup">Github</a>
        </div>
      </footer>
      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    </div>
  );
}