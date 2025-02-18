import React from "react";
import { Players } from "./players";
import { SpeedGame } from "./speedGame";

export function Play({props}) {
  return (
    <main className="container-fluid bg-dark text-center">
      <div>
      <SpeedGame />
      <Players />
      </div>
    </main>
  );
}
