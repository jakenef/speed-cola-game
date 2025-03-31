import React from 'react';
import { useNavigate } from 'react-router-dom';

import Button from 'react-bootstrap/Button';

export function Authenticated(props) {
  const navigate = useNavigate();

  function logout() {
    fetch(`/api/auth/logout`, {
      method: 'delete',
    })
      .catch(() => {
        // Logout failed. Assuming offline
      })
      .finally(() => {
        localStorage.removeItem('userName');
        props.onLogout();
      });
  }

  return (
    <div>
      <h4 style={{ marginBottom: "2rem" }} className='playerName'>Player: {props.userName}</h4>
      <Button variant='btn custom-button me-2' onClick={() => navigate('/play')}>
        Play
      </Button>
      <Button variant='btn btn-secondary' onClick={() => logout()}>
        Logout
      </Button>
    </div>
  );
}
