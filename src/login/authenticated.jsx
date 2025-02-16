import React from 'react';
import { useNavigate } from 'react-router-dom';

import Button from 'react-bootstrap/Button';

export function Authenticated(props) {
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem('userName');
    props.onLogout();
  }

  return (
    <div>
      <div style={{ marginBottom: "2rem" }} className='playerName'>Username: {props.userName?.split('@')[0]}</div>
      <Button variant='btn custom-button me-2' onClick={() => navigate('/play')}>
        Play
      </Button>
      <Button variant='btn btn-secondary' onClick={() => logout()}>
        Logout
      </Button>
    </div>
  );
}
