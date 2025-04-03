import React from "react";

export function About() {
  return (
    <main className="container-fluid bg-dark text-center">
      <div id="picture" class="picture-box">
        <img width="200px" src="speedcolaCropped.png" alt="random" />
      </div>

      <p className="not-too-wide">
        Fuel your reflexes with <b>The Speed Cola Game</b>, the ultimate
        reaction-speed challenge! Inspired by the iconic perk from{" "}
        <i>Call of Duty: Black Ops Zombies</i>{" "}
        that speeds up the player, this website will put your reflexes to the
        test and measure your reaction time. In three attempts, you will click
        the screen when it changes color and you will be given an average
        reaction time and a place in the global leaderboard. If you are fast
        enough, you can prove that you have the Speed Cola perk in real life!
        This website is for educational purposes.
      </p>
      <p>Acknowledgements: Gray Wheeler (Graphic Design)</p>
      <p>
        Other Sites:{" "}
        <a
          href="https://jacobnef.com"
          style={{ color: "#3db531"}}
        >
          jacobnef.com
        </a>
      </p>
    </main>
  );
}
