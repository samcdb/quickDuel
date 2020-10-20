//const { emit } = require("process");

//const { Socket } = require("dgram");

const createTicTacToe = () => {
  let tiles;

  const initBoard = () => {
    tiles = document.querySelectorAll(".tile");
    for (tile of tiles) {
      tile.className = "tile";
    }
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
  let tiles = initBoard();
  let aimBtn = initAimCourt();

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
    document.getElementById("aim-game").style.display = "block";
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
    tiles = initBoard();
  });

  sock.on("updateHealth", ({id, hp}) => {
    console.log("hi");
    let playerHealthBar = document.getElementById("player-hp-bar");
    let enemyHealthBar = document.getElementById("enemy-hp-bar");
    console.log(hp);
    if (playerID === id) {
      playerHealthBar.height = hp + "%";
    } else {
      enemyHealthBar.height = hp + "%";
    }
  });

  sock.on("turnUpdate0X", ({ turnNow, time }) => {
    if (turnNow === sock.id) {
      document.getElementById("timer").style.display = "block";
      document.getElementById("seconds").textContent = Math.floor(time / 1000);
      document.getElementById("ms").textContent = (time % 1000) / 10;
    } else {
      document.getElementById("timer").style.display = "none";
    }
  });

  sock.on("tileClick", ({ tileNum, currentPlayerID}) => {
    console.log("client ID = " + playerID + " received = " + currentPlayerID);
    console.log("tile: " + tileNum);
    console.log("tiles: " + tiles.length);
    if (playerID === currentPlayerID) {
      tiles[tileNum].classList.add("tile-clicked");
    } else {
      tiles[tileNum].classList.add("enemy-tile-clicked");
    }
  });

  sock.on("turnUpdateAim", ({attacking, coords, btnWidth}) => {
    let activeArea = document.getElementById("active-area");
    let areaWidth = activeArea.offsetWidth;
    let areaHeight = activeArea.offsetHeight;
    let enemyBtn = document.getElementById("enemy-btn");

    enemyBtn.style.width = btnWidth + "px";
    enemyBtn.style.height = btnWidth + "px";
    enemyBtn.style.left = areaWidth / 2 + (areaWidth / 2 - coords[0]) - btnWidth + "px";
    enemyBtn.style.top =  areaHeight / 2 - (coords[1] - areaHeight / 2) + "px";
    enemyBtn.style.display = "block";

    aimBtn.style.width = btnWidth + "px";
    aimBtn.style.height = btnWidth + "px";
    aimBtn.style.left = coords[0] + "px";
    aimBtn.style.top =  coords[1] + "px";
    if (attacking === sock.id) {
      aimBtn.style.backgroundColor = "green";
    } else {
      aimBtn.style.backgroundColor = "blue";
    }
    aimBtn.style.display = "block";
    //start recording time
    //place button
    stopWatch();
  });

  sock.on("startNextMode", ({fromMode, toMode}) => {
    //transition
    console.log("starting next game mode");
    //
    console.log("transition from " + fromMode + " to " + toMode );
    document.getElementById(fromMode).style.display = "none";
    document.getElementById(toMode).style.display = "block";

    sock.emit("startNextMode", gameID);
  });
  for (let i = 0; i < tiles.length; i++) {
    tiles[i].addEventListener("click", () => {
      console.log(i);
      const tileNum = i;
      //display to user that tile was clicked and change tileTable accordingly
      sock.emit("tileClick", { tileNum, playerID, gameID});
      
    });
  }

  // on click listener for aim game button
  aimBtn.addEventListener("click", () => {
    let timeTaken = stopWatch();
    aimBtn.style.display = "none";
    sock.emit("aimClick", {timeTaken, gameID});
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