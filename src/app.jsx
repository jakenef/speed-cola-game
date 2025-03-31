import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./app.css";
import "./leaderboard/leaderboard.css";
import { BrowserRouter, NavLink, Route, Routes } from "react-router-dom";
import { Login } from "./login/login";
import { Play } from "./play/play";
import { Leaderboard } from "./leaderboard/leaderboard";
import { About } from "./about/about";
import { AuthState } from "./login/authState";
import ProtectedRoute from "./protectedRoute";

export default function App() {
  const [userName, setUserName] = React.useState(
    localStorage.getItem("userName") || ""
  );
  const currentAuthState = userName
    ? AuthState.Authenticated
    : AuthState.Unauthenticated;
  const [authState, setAuthState] = React.useState(currentAuthState);

  return (
    <div className="body bg-dark text-light">
      <BrowserRouter>
        <header className="bg-dark text-light">
          <nav className="navbar navbar-dark navbar-expand-lg bg-dark">
            <div className="container-fluid">
              <div className="navbar-brand">
                <img src="speedcolaCropped.png" width="30"></img> The Speed-Cola
                Game
              </div>
              <button
                className="navbar-toggler"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#navbarNav"
                aria-controls="navbarNav"
                aria-expanded="false"
                aria-label="Toggle navigation"
              >
                <span className="navbar-toggler-icon"></span>
              </button>
              <div className="collapse navbar-collapse" id="navbarNav">
                <ul className="navbar-nav">
                  <li className="nav-item">
                    <NavLink className="nav-link" to="/">
                      Login
                    </NavLink>
                  </li>
                  {authState === AuthState.Authenticated && (
                    <li className="nav-item">
                      <NavLink className="nav-link" to="play">
                        Play
                      </NavLink>
                    </li>
                  )}
                  {authState === AuthState.Authenticated && (
                    <li className="nav-item">
                      <NavLink className="nav-link" to="leaderboard">
                        Leaderboard
                      </NavLink>
                    </li>
                  )}
                  <li className="nav-item">
                    <NavLink className="nav-link" to="about">
                      About
                    </NavLink>
                  </li>
                </ul>
              </div>
            </div>
          </nav>
        </header>

        <Routes>
          <Route
            path="/"
            element={
              <Login
                userName={userName}
                authState={authState}
                onAuthChange={(userName, authState) => {
                  setAuthState(authState);
                  setUserName(userName);
                }}
              />
            }
            exact
          />
          <Route
            path="/play"
            element={
              <ProtectedRoute>
                <Play userName={userName} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute>
                <Leaderboard userName={userName} />
              </ProtectedRoute>
            }
          />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>

        <footer className="bg-dark text-white-50">
          <div className="container-fluid">
            <span className="text-reset">Jacob Nef</span>
            <a
              className="text-reset ms-3"
              href="https://github.com/jakenef/startup"
            >
              Github
            </a>
          </div>
        </footer>
      </BrowserRouter>
    </div>
  );
}

function NotFound() {
  return (
    <main className="container-fluid bg-secondary text-center">
      404: Return to sender. Address unknown.
    </main>
  );
}
