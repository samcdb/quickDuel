const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");
const socketio = require("socket.io");
const Game = require("./Game");
const app = express();

const clientPath = `${__dirname}/../client`;
const port = 8080;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(clientPath));  


const server = http.createServer(app);
const io = socketio(server);
const activeGames = {};
console.log(`Serving static from ${clientPath}`);


server.on("error", (err) => {
  console.error(err);
});

server.listen(port, () => {
  console.log("server launched");
});

io.on("connection", (socket) => {
  const lobby = "lobby";
  socket.emit("sessionInit", socket.id);
  socket.emit("message", "You are connected");
  console.log("a client has connected");

  socket.join(lobby);
  lookForGame(lobby);
  
  const tileClick = ({ tileNum, gameID}) => {
    // don't do anything if it is not game player's turn
    let game = activeGames[gameID];
    if(game.board.alreadyClicked()) return;
    if (game.whoseTurn() !== socket.id) return;
    // compute move
    clearInterval(game.timeInterval);
    const gameWon = game.board.makeMove(tileNum, socket.id);
    if (gameWon === -1) return;
    // emit move to both players
    io.to(game.gameID).emit("tileClick", { tileNum, currentPlayerID: socket.id});

    if (gameWon === true) {
      socket.emit("message", "NICE");
      io.to(game.gameID).emit("message", "TIC TAC TOE OVER");
      io.to(game.gameID).emit("gameUpdate", socket.id); //change
      return;
    }

    game.lastPlayer = socket.id;
    update0XDuel(game, 100);
  };

  const aimClick = ({timeTaken, gameID}) => {
    let game = activeGames[gameID];

    if (game.whoseTurn() === socket.id) {
      game.reactionArr[0] = timeTaken;  //attacker
      //console.log("attacked");
    } else {
      game.reactionArr[1] = timeTaken;  //defender
     // console.log("defended");
    }

    if (game.reactionArr[0] && game.reactionArr[1]) {     // CANNOT END TURN AFTER RECEIVING FIRST CLICK IN CASE OF LATENCY
      console.log("both clicked");
      clearInterval(game.timeInterval);
      let attacker = (game.lastPlayer === game.players[0].id) ? 1 : 0;
      let defender = (game.lastPlayer === game.players[0].id) ? 0 : 1;
      let attackSuccess = game.reactionArr[0] < game.reactionArr[1];
     
      if (attackSuccess) {
        // decrease health bar
        console.log("BOTH HAVE CLICKED");
        game.updateHealth(defender, -10);
       // game.attackAnimation(attacker, "aim");
      }

      game.lastPlayer = game.players[attacker].id;
      updateAimDuel(game);
    }
  };

  socket.on("message", (text) => io.emit("message", text));
  socket.on("tileClick", tileClick);
  socket.on("aimClick", aimClick);
  socket.on("foundGame", (gameID) => {
    let game = activeGames[gameID];
    game.playersReady++;
    
    if (game.playersReady === 2) {
      game.playersReady = 0;
      startGame(game);
    }
  });
  socket.on("startNextMode", (gameID) => {
    let game = activeGames[gameID];
    game.playersReady++;

    if (game.playersReady === 2) {
      if (game.roundCount % 2 === 0){
        console.log("starting aim game");
        game.playersReady = 0;
        game.createAimDuel(3, 40, 900, 804); 
        updateAimDuel(game);
      } else {
        console.log('Starting 0 X');
        game.playersReady = 0;
        update0XDuel(game, 100);
      }
    }

  })

});

// get move from player - (tile, id)
// io.emit  (tile, id, win)

//  client: own id message makes tile green, other makes red, same with win basically

function getClientsInRoom(room) {
  const clients = [];
  for (let id in io.sockets.adapter.rooms[room].sockets) {
    clients.push(io.sockets.adapter.nsp.connected[id]);
  }
  return clients;
}

// matchmaking system
function lookForGame(lobby) {
  const players = getClientsInRoom(lobby);
  console.log(players.length);

  if (players.length >= 2) {
    console.log("2 players ready for game");
    players[0].leave(lobby);
    players[1].leave(lobby);

    let newGame = new Game(players[0].id, players[1].id);
    players[0].join(newGame.gameID);
    players[1].join(newGame.gameID);
    activeGames[newGame.gameID] = newGame;
    //Once a game is found, send ID to players to send back to server
    console.log("found a game with id: " + newGame.gameID);
    io.to(newGame.gameID).emit('foundGame', newGame.gameID);
  }
  
}

// start the game for the matched players
function startGame(game) {
  
  let secondTurn = Math.floor(Math.random() * 2);
  game.lastPlayer = game.players[secondTurn].id;
  //set up both players
  io.to(game.gameID).emit("startGame");
}


// UPDATE HEALTH 
//game.players[0].conn.emit("updateHealth", {id: player.id, hp: player.health}); 
//game.players[1].conn.emit("updateHealth", {id: player.id, hp: player.health}); 

// ############################ NOUGHTS AND CROSSES ############################
function update0XDuel(game, timeStep) {
  let turnNow = game.whoseTurn();
  game.timeLeft = game.turnTime;  // ########################################

  game.timeInterval = setInterval(
    function () {

      io.to(game.gameID).emit("turnUpdate0X", {
        turnNow,
        time: game.timeLeft,
      });

      game.timeLeft -= timeStep;

      if (game.timeLeft < 0) {
        clearInterval(game.timeInterval);
        io.to(game.gameID).emit("gameUpdate", game.lastPlayer);
        game.lastPlayer = game.players[turnNow];  // ??????????????/
        game.board.clear();  //clear board
      }
      console.log("time left: " + game.timeLeft);
    },
    timeStep
  );
}
// ############################## aim game ######################


function updateAimDuel(game) {
  game.reactionArr = [];
  console.log("player 1 health: " + game.players[0].health);
  console.log("player 2 health: " + game.players[1].health);
  if (game.coordArr.length === 0) {
    console.log("aim duel over");
    game.roundCount++;
    // need to randomise next game
    let fromMode = "aim-game";       // implement game.currentMode
    let toMode = "tictac-game";
    io.to(game.gameID).emit("startNextMode", {fromMode, toMode});
    return;
  }
   
  let attacker = (game.lastPlayer === game.players[0].id) ? 1 : 0; 
  let defender = (game.lastPlayer === game.players[0].id) ? 0 : 1;
  let coords = game.coordArr.pop();

  io.to(game.gameID).emit("turnUpdateAim", {
    attacking: game.players[attacker].id,
    coords: coords,
    btnWidth: game.aimBtnWidth,
  }); 

  game.timeInterval = setTimeout(function() {
    // case when only 1 player has clicked in time
    if (game.reactionArr[0]) {
      //attack success
      game.updateHealth(defender, -10);
    } 

    game.lastPlayer = game.players[attacker].id;
    updateAimDuel(game);
  }, 2000);
  
}

// finds the relevant game

// emit turnUpdate, true/false
// on true, display timer on client side
// server room emit interval updates
// on click does turnUpdate
// if timer runs out, endGame



