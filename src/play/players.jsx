import React, { useEffect, useCallback } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { GameEvent, GameNotifier } from './gameNotifier';
import './players.css';

export function Players() {
  // Memoize the handler function to ensure the same reference is used
  const handleGameEvent = useCallback((event) => {
    let message = 'Unknown event';
    if (event.type === GameEvent.End) {
      message = `${event.from.split('@')[0]} got a time of ${event.value.score} ms`;
    } else if (event.type === GameEvent.System) {
      message = event.value.msg;
    }

    // Display toast with custom styles
    toast(message, {
      style: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)', // Slight transparency
        color: 'black',
        boxShadow: '0px 4px 10px rgba(0,0,0,0.1)',
        borderRadius: '10px',
        padding: '10px',
      },
      hideProgressBar: true,
    });
  }, []);

  useEffect(() => {
    GameNotifier.addHandler(handleGameEvent);

    return () => {
      GameNotifier.removeHandler(handleGameEvent);
    };
  }, [handleGameEvent]); // Ensure useEffect only depends on the memoized handleGameEvent

  return (
    <div className="players">
      {/* Toast container with custom position */}
      <ToastContainer autoClose={3000} className="mobile-toast-container" />
    </div>
  );
}
