//const { emit } = require("process");

const createTicTacToe = () => {
  let tiles;

  const initBoard = () => {
    tiles = document.querySelectorAll(".tile");
    return tiles;
  };

  function goodGame(win) {
    let resultClass;

    if (win === true) {
      resultClass = "winner-pov";
    } else {
      resultClass = "loser-pov";
    }
    gameOverFlash(resultClass, 3);
  }

  function gameOverFlash(classToggle, count) {
    setTimeout(function () {
      for (let i = 0; i < tiles.length; i++) {
        tiles[i].classList.toggle(classToggle);
      }

      if (count > 0) {
        gameOverFlash(classToggle, count - 1);
      }
    }, 400);
  }

  return { initBoard, goodGame };
}; 
const createAimGame = () => {
  let actionBtn;
  let stopWatchTime = 0;

  const initAimCourt = () => {
    actionBtn = document.querySelector('#action-btn');
    return actionBtn;
  };

  const stopWatch = () => {
    let reactionTime = Date.now() - stopWatchTime; 
    stopWatchTime = Date.now();
    return reactionTime;
  };

  return {initAimCourt, stopWatch};
};

const onChatSubmitted = (sock) => (e) => {
  e.preventDefault();

  const input = document.querySelector("#chat");
  const text = input.value;
  input.value = "";

  sock.emit("message", text);
};

const log = (text) => {
  console.log("This is the text that was passed in: " + text);
  const parent = document.querySelector("#events");
  const el = document.createElement("li");
  el.innerHTML = text;

  parent.appendChild(el);
  parent.scrollTop = parent.scrollHeight;
};

(() => {
  const sock = io();
  let playerID;
  let gameID;
  const { initBoard, goodGame } = createTicTacToe();
  const {initAimCourt, stopWatch} = createAimGame();
  const tiles = initBoard();
  const aimBtn = initAimCourt();

  sock.on("message", log);

  sock.on("sessionInit", (myID) => {
    playerID = myID;
    console.log(myID);
  });

  sock.on("foundGame", (receivedGameID) => {
    gameID = receivedGameID;
    sock.emit("foundGame", gameID);
  });

  sock.on("startGame", () => {
    console.log("players starting game");
    //#################################
    //change
    document.getElementById("aim-screen").style.display = "block";
    document.getElementById("lobby-screen").style.display = "none";
    console.log("I have the ID " + gameID);
    sock.emit("startNextMode", gameID);
  }); 

  sock.on("gameUpdate", (moveID) => {
    if (playerID === moveID) {
      goodGame(true);
    } else {
      goodGame(false);
    }
  });

  sock.on("turnUpdate0X", ({ isTurn, time }) => {
    if (isTurn) {
      document.getElementById("timer").style.display = "block";
      document.getElementById("seconds").textContent = Math.floor(time / 1000);
      document.getElementById("ms").textContent = (time % 1000) / 10;
    } else {
      document.getElementById("timer").style.display = "none";
    }
  });

  sock.on("tileClick", ({ tileNum, currentPlayerID }) => {
    console.log("client ID = " + playerID + " received = " + currentPlayerID);
    console.log("tile: " + tileNum);
    console.log("tiles: " + tiles.length);
    if (playerID === currentPlayerID) {
      tiles[tileNum].classList.add("tile-clicked");
    } else {
      tiles[tileNum].classList.add("enemy-tile-clicked");
    }
  });

  sock.on("turnUpdateAim", ({attacking, coords}) => {
    if (attacking) {
      console.log("attack");
    } else {
      console.log("defend");
    }
    //start recording time
    //place button
    stopWatch();
  });

  sock.on("startNextMode", () => {
    //transition
    console.log("starting next game mode");
    sock.emit("startNextMode", gameID);
  });
  for (let i = 0; i < tiles.length; i++) {
    tiles[i].addEventListener("click", () => {
      console.log(i);
      const tileNum = i;
      //display to user that tile was clicked and change tileTable accordingly
      sock.emit("tileclick", { tileNum, playerID, gameID});
    });
  }

  aimBtn.addEventListener("click", () => {
    let timeTaken = stopWatch();
    sock.emit("aimClick", {timeTaken, playerID, gameID});
    aimBtn.style.display = "none";
  });
  document
    .querySelector("#chat-form")
    .addEventListener("submit", onChatSubmitted(sock));
})();

//###################################################################### AIM ######################################################################

//  app.js makes array of random co-ords, chooses first turn
//  sends to both players, uses whoseTurn (to attack) to show who attacks and who defends
//  turn changes after first input received and then sends new co-ords while deciding who clicked first
//  health goes down or stays the same after deciding who clicked first
//  turns are still timed for the attacker


// app -> function to generate array of random co-ords on game start
// app -> function to send turn info with co-ords