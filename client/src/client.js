//const { emit } = require("process");

const createTicTacToe = (sock) => {
  let tiles;

  const init = () => {
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

  return { init, goodGame };
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
  const { init, goodGame } = createTicTacToe();
  const tiles = init();

  sock.on("message", log);

  sock.on("sessionInit", (myID) => {
    init(sock, myID, tiles);
    console.log("ïn session init tiles: " + tiles);
    playerID = myID;
    console.log(myID);
    sock.emit("startGame", playerID);
  });

  sock.on("tileclick", ({ tileNum, currentPlayerID }) => {
    console.log("client ID = " + playerID + " received = " + currentPlayerID);
    console.log("tile: " + tileNum);
    console.log("tiles: " + tiles.length);
    if (playerID === currentPlayerID) {
      tiles[tileNum].classList.add("tile-clicked");
    } else {
      tiles[tileNum].classList.add("enemy-tile-clicked");
    }
  });

  sock.on("gameUpdate", (moveID) => {
    if (playerID === moveID) {
      goodGame(true);
    } else {
      goodGame(false);
    }
  });

  sock.on("startGame", (currGameID) => {
    gameID = currGameID;
    console.log("players starting game");
    document.getElementById("screen-tictac").style.display = "block";
    document.getElementById("screen-lobby").style.display = "none";
  });

  sock.on("turnUpdate", ({ isTurn, time }) => {
    if (isTurn) {
      document.getElementById("timer").style.display = "block";
      document.getElementById("seconds").textContent = Math.floor(time / 1000);
      document.getElementById("ms").textContent = (time % 1000) / 10;
    } else {
      document.getElementById("timer").style.display = "none";
    }
  });

  for (let i = 0; i < tiles.length; i++) {
    tiles[i].addEventListener("click", function () {
      console.log(i);
      const tileNum = i;
      //display to user that tile was clicked and change tileTable accordingly
      sock.emit("tileclick", { tileNum, playerID, gameID });
    });
  }

  document
    .querySelector("#chat-form")
    .addEventListener("submit", onChatSubmitted(sock));
})();

//###################################################################### AIM ######################################################################
