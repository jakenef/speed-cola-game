import React from "react";

import Button from "react-bootstrap/Button";
import { MessageDialog } from "./messageDialog";

export function Unauthenticated(props) {
  const [userName, setUserName] = React.useState(props.userName);
  const [password, setPassword] = React.useState("");
  const [displayError, setDisplayError] = React.useState(null);

  async function loginUser() {
    localStorage.setItem("userName", userName);
    props.onLogin(userName);
  }

  async function createUser() {
    localStorage.setItem("userName", userName);
    props.onLogin(userName);
  }

  return (
    <>
      <div>
        <h2 style={{ marginBottom: "2rem" }}>
          Login to play and be put on the leaderboard!
        </h2>
        <form style={{ marginTop: "2rem" }}>
          <div className="input-group mb-3 w-75 mx-auto">
            <span className="input-group-text">@</span>
            <input
              className="form-control"
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="speed@cola.com"
            />
          </div>
          <div className="input-group mb-3 w-75 mx-auto">
            <span className="input-group-text">🔒</span>
            <input
              className="form-control"
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="dont use password1"
            />
          </div>
          <Button
            variant="btn custom-button me-2"
            onClick={() => loginUser()}
            disabled={!userName || !password}
          >
            Login
          </Button>
          <Button
            variant="btn btn-secondary"
            onClick={() => createUser()}
            disabled={!userName || !password}
          >
            Create
          </Button>
        </form>
      </div>

      <MessageDialog
        message={displayError}
        onHide={() => setDisplayError(null)}
      />
    </>
  );
}
