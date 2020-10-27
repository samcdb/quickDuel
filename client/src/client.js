
const createTicTacToe = () => {
  let tiles;

  const initBoard = () => {
    tiles = document.querySelectorAll(".tile");
    for (tile of tiles) {
      tile.className = "tile";
    }
    return tiles;
  };

  function goodGame(player, winner, func) {
    let resultClass;
    if(!winner) {
      resultClass = "draw-pov";
    }
    else if (player === winner) {
      resultClass = "winner-pov";
    } 
    else {
      resultClass = "loser-pov";
    }
    gameOverFlash(resultClass, 3, func);

  }

  function gameOverFlash(classToggle, count, callBackFunc) {
    setTimeout(function () {
      for (let i = 0; i < tiles.length; i++) {
        tiles[i].classList.toggle(classToggle);
      }

      if (count > 0) {
        gameOverFlash(classToggle, count - 1, callBackFunc);
      } 
      else {
        callBackFunc();
      }
    }, 400);

  }

  return { initBoard, goodGame };
}; 

const createAimGame = () => {
  let aimBtn;
  let enemyBtn;
  let activeArea;
  let stopWatchTime = 0;
  
  const initAimCourt = () => {
    activeArea = document.getElementById("active-area");
    aimBtn = document.getElementById('aim-btn');
    enemyBtn = document.getElementById('enemy-btn');

    return {
      aimBtn,
      enemyBtn,
      activeArea
    };
  };

  const aimStopWatch = () => {
    let reactionTime = Date.now() - stopWatchTime; 
    stopWatchTime = Date.now();
    return reactionTime;
  };

  return {initAimCourt, aimStopWatch};
};

const createReactGame = () => {
  let reactBlock;
  let reactText;
  let stopWatchTime = 0;

  const initReactGame = () => {
    reactBlock = document.getElementById('reaction-block');
    reactText = document.getElementById('react-won-lost');
    return {
      reactBlock,
      reactText,
    };
  }
  const reactStopWatch = () => {
    let reactionTime = Date.now() - stopWatchTime; 
    stopWatchTime = Date.now();
    return reactionTime;
  };

  return {
    initReactGame,
    reactStopWatch,
  };
}

const createTypeGame = () => {
  let playerSentence;
  let enemySentence;

  const initTypeGame = () => {
    playerSentence = document.getElementById('player-sentence');
    enemySentence = document.getElementById('enemy-sentence');
    textBar = document.getElementById('type-bar');
    
    return {
      playerSentence,
      enemySentence,
    };
  };

  const setSentences = (text) => {
    console.log("the sentence is " + text);
    text.split('').forEach((char) => {
      playerSentence.innerHTML += `<span class="untyped player-typed">${char}</span>`;
      enemySentence.innerHTML += `<span class="untyped enemy-typed">${char}</span>`;
    });
  };

  const showProgress = (typedText, sentence) => {
    let spanArr = sentence.getElementsByTagName('span');
    let typedArr = typedText.split('');

    for (let span of spanArr) {
      span.classList.add("untyped");
    }

    for (let i = 0; i < typedArr.length; i++) {
      console.log("checking if same");
      if (typedArr[i] === spanArr[i].innerText) {
        spanArr[i].classList.remove("untyped");
      } else {
        break;
      }
    }
  };

  const clearTypeGame = () => {
    playerSentence.innerHTML = "";
    enemySentence.innerHTML = "";
    textBar.value = "";
  };

  return {
    initTypeGame,
    setSentences,
    showProgress,
    clearTypeGame,
  }
};

const onChatSubmitted = (sock) => (e) => {
  e.preventDefault();

  const input = document.querySelector("#chat");
  const text = input.value;
  input.value = "";

  sock.emit("message", text);
};

const log = (text) => {
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

  const {initBoard, goodGame} = createTicTacToe();
  const {initAimCourt, aimStopWatch} = createAimGame();
  const {initReactGame, reactStopWatch} = createReactGame();
  const {initTypeGame, setSentences, showProgress, clearTypeGame} = createTypeGame(); 

  let tiles = initBoard();
  let {aimBtn, enemyBtn} = initAimCourt();
  let {reactBlock, reactText} = initReactGame();
  let {playerSentence, enemySentence} = initTypeGame();

  sock.on("message", log);

  sock.on("sessionInit", (myID) => {
    playerID = myID;
    console.log(myID);
  });

  sock.on("foundGame", (receivedGameID) => {
    console.log("received ID: " + receivedGameID);
    gameID = receivedGameID;
    sock.emit("startNextMode", gameID);
  });

  sock.on("game0Xover", (moveID) => {
    // async function     
    goodGame(playerID, moveID, () => {
      sock.emit("startNextMode", gameID);
    });
    tiles = initBoard();
    
  });


  sock.on("updateHealth", ({id, hp}) => {
    console.log(`updating player ${id} with health ${hp}`);
    let playerHealthBar = document.getElementById("player-hp-bar");
    let enemyHealthBar = document.getElementById("enemy-hp-bar");

    if (sock.id === id) {
      playerHealthBar.style.height = hp + "%";
    } else {
      enemyHealthBar.style.height = hp + "%";
    }
  });

  sock.on("turnUpdateReact", () => {
    reactBlock.style.backgroundColor = "yellow";
    reactStopWatch(); 
  });

  sock.on("gameReactOver", (winningPlayer) => {
    if (sock.id === winningPlayer) {
      reactText.innerHTML = "WON"
      reactBlock.style.backgroundColor = "green"
    }
    else {
      reactText.innerHTML = "LOST";
      reactBlock.style.backgroundColor = "red";
    }

    setTimeout(() => {
      sock.emit("startNextMode", gameID);
    }, 2000);
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

  sock.on("startTypeDuel", (sentence) => {
    setSentences(sentence);
  });

  sock.on("turnUpdateType", ({typedText, playerID}) => {
    if (sock.id === playerID) {
      showProgress(typedText, playerSentence);
    } else {
      showProgress(typedText, enemySentence);
    }
  });

  sock.on("typeDuelOver", () => {
    console.log("duel Over");
    // do animation
    clearTypeGame();
    sock.emit("startNextMode", gameID);
  })

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
    aimBtn.style.display = "block";
    enemyBtn.style.display = "block";

    enemyBtn.style.width = btnWidth + "px";
    enemyBtn.style.height = btnWidth + "px";
    enemyBtn.style.right = coords[0] + "px";
    enemyBtn.style.bottom = coords[1] + "px";

    aimBtn.style.width = btnWidth + "px";
    aimBtn.style.height = btnWidth + "px";
    aimBtn.style.left = coords[0] + "px";
    aimBtn.style.top =  coords[1] + "px";

    if (attacking === sock.id) {
      aimBtn.style.backgroundColor = "green";
    } else {
      aimBtn.style.backgroundColor = "blue";
    }
    //start recording time
    //place button
    aimStopWatch();
  });

  sock.on("startNextMode", ({fromMode, toMode}) => {
    //transition
    console.log("starting next game mode");
    console.log(`from ${fromMode} to ${toMode}`);
    document.getElementById(fromMode).style.display = "none";
    document.getElementById(toMode).style.display = "block";
  });

  for (let i = 0; i < tiles.length; i++) {
    tiles[i].addEventListener("click", () => {
      const tileNum = i;
      //display to user that tile was clicked and change tileTable accordingly
      sock.emit("tileClick", { tileNum, playerID, gameID});
      
    });
  }

  // on click listener for aim game button
  aimBtn.addEventListener("click", () => {
    let timeTaken = aimStopWatch();
    aimBtn.style.display = "none";
    sock.emit("aimClick", {timeTaken, gameID});
  });

  reactBlock.addEventListener("click", () => {
    let timeTaken = reactStopWatch();
    reactBlock.style.border = "2px solid black";
    sock.emit("reactClick", {timeTaken, gameID})
  });

  textBar.addEventListener('input', (e) => {
    let typedText = e.target.value;
    sock.emit("textInput", {typedText, gameID});
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