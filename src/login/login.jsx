import React from 'react';


export function Login() {
  return (
    <main className="container-fluid bg-dark text-center text-light">
      <div className="center-group">
        <div className="card custom-card mb-3 w-100" style={{ maxWidth: "30rem" }}>
          <div className="card-body">
            <h5 className="card-title fs-1">Welcome to the Speed-Cola Click Test!</h5>
          </div>
        </div>
        <h2>Login to play and be put on the leaderboard!</h2>
      </div>
      <form>
        <div className="input-group mb-3">
          <span className="input-group-text">@</span>
          <input className="form-control" type="text" placeholder="speed@cola.com" />
        </div>
        <div className="input-group mb-3">
          <span className="input-group-text">🔒</span>
          <input className="form-control" type="password" placeholder="don't use password1" />
        </div>
        <button type="submit" className="btn custom-button me-2">Login</button>
        <button type="button" className="btn btn-secondary">Create User</button>
      </form>
    </main>
  );
}
