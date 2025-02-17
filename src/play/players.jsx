import React from 'react';

import { GameEvent, GameNotifier } from './gameNotifier';

export function Players() {

  const [events, setEvent] = React.useState([]);

  React.useEffect(() => {
    GameNotifier.addHandler(handleGameEvent);

    return () => {
      GameNotifier.removeHandler(handleGameEvent);
    };
  }, []);

  function handleGameEvent(event) {
    setEvent((prevEvents) => {
      let newEvents = [event, ...prevEvents];
      if (newEvents.length > 10) {
        newEvents = newEvents.slice(1, 10);
      }
      return newEvents;
    });
  }

  function createMessageArray() {
    const messageArray = [];
    for (const [i, event] of events.entries()) {
      let message = 'unknown';
      if (event.type === GameEvent.End) {
        message = ` got a time of ${event.value.score} s`;
      } else if (event.type === GameEvent.System) {
        message = event.value.msg;
      }

      messageArray.push(
        <div key={i} className='event'>
          <span className={'player-event'}>{event.from.split('@')[0]}</span>
          {message}
        </div>
      );
    }
    return messageArray;
  }

  return (
    <div className='players'>
      <div id='player-messages'>{createMessageArray()}</div>
    </div>
  );
}
