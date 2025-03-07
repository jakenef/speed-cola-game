import React from "react";

import Button from "react-bootstrap/Button";
import { MessageDialog } from "./messageDialog";

export function Unauthenticated(props) {
  const [userName, setUserName] = React.useState(props.userName);
  const [password, setPassword] = React.useState("");
  const [displayError, setDisplayError] = React.useState(null);

  async function loginUser() {
    loginOrCreate(`/api/auth/login`);
  }

  async function createUser() {
    loginOrCreate(`/api/auth/create`);
  }

  async function loginOrCreate(endpoint) {
    setDisplayError(null);
    const response = await fetch(endpoint, {
      method: 'post',
      body: JSON.stringify({ email: userName, password: password }),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
    });
    if (response?.status === 200) {
      localStorage.setItem('userName', userName);
      props.onLogin(userName);
    } else {
      const body = await response.json();
      setDisplayError(`⚠ Error: ${body.msg}`);
    }
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
              className={'form-control ${displayError ? "input-error" : ""}'}
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="dont use password1"
            />
          </div>

          {displayError && <p className="error-msg">{displayError}</p>}

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
    </>
  );
}
