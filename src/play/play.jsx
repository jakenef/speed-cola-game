import React from "react";
import { Players } from "./players";
import { SpeedGame } from "./speedGame";

export function Play({userName}) {
  return (
    <main className="container-fluid bg-dark text-center">
      <div>
      <SpeedGame userName={userName} />
      <Players />
      </div>
    </main>
  );
}
