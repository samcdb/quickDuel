const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");
const socketio = require("socket.io");
const createBoard = require("./create-board");
const Game = require("./Game");
const app = express();

const clientPath = `${__dirname}/../client`;
const port = 8080;
const ip = "127.0.0.1";
const gameArr = [];

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(clientPath));

const server = http.createServer(app);
const { makeMove, getBoard, clear } = createBoard();
const io = socketio(server);

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
  
  const tileClick = ({ tileNum, playerID, gameID}) => {
    // don't do anything if it is not this player's turn
    let game = getGame(gameID);
    if (game.whoseTurn() !== playerID) return;
    // compute move
    clearInterval(game.timeInterval);
    const gameWon = makeMove(tileNum, playerID);
    const currentPlayerID = playerID; //having naming issues with passing objects that have the same property names - fix this
    // emit move to both players
    io.to(game.gameID).emit("tileClick", { tileNum, currentPlayerID });

    if (gameWon === true) {
      socket.emit("message", "NICE");
      io.to(game.gameID).emit("message", "TIC TAC TOE OVER");
      io.to(game.gameID).emit("gameUpdate", playerID); //change
      return;
    }

    game.lastPlayer = playerID;
    game.update0XDuel(100);
  };

  const aimClick = ({timeTaken, playerID, gameID}) => {
    let game = getGame(gameID);

    if (game.whoseTurn() === playerID) {
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
      game.updateAimDuel();
    }
  };

  socket.on("message", (text) => io.emit("message", text));
  socket.on("tileClick", tileClick);
  socket.on("aimClick", aimClick);
  socket.on("foundGame", (gameID) => {
    let game = getGame(gameID);
    game.playersReady++;
    
    if (game.playersReady === 2) {
      game.playersReady = 0;
      startGame(game);
    }
  });
  socket.on("startNextMode", (gameID) => {
    let game = getGame(gameID);
    game.playersReady++;

    if (game.playersReady === 2) {
      if (game.roundCount % 2 === 0){
        console.log("starting aim game");
        game.playersReady = 0;
        game.createAimDuel(100, 40, 900, 804); 
        game.updateAimDuel();
      } else {
        console.log('Starting 0 X');
        game.playersReady = 0;
        game.update0XDuel(100);
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

    let newGame = new Game(players[0], players[1]);
    players[0].join(newGame.gameID);
    players[1].join(newGame.gameID);
    gameArr.push(newGame);
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

// finds the relevant game
function getGame(gameID) {
  let count = 0;
  let game = gameArr[count];
  while (game.gameID !== gameID) {
    count++;
    game = gameArr[count];
  }

  return game;
}

// emit turnUpdate, true/false
// on true, display timer on client side
// server room emit interval updates
// on click does turnUpdate
// if timer runs out, endGame



