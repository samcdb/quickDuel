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
  //io.sockets.adapter.rooms[duelRoom].length
  //console.log(io.sockets.adapter.rooms[duelRoom].length);
  let game = lookForGame(lobby);
  if (game) {
    startGame(game);
  }

  const onMove = ({ tileNum, playerID, gameID }) => {
    let game = getGame(gameID);
    // don't do anything if it is not this player's turn
    if (game.whoseTurn() !== playerID) return;
    // compute move
    clearInterval(game.timeInterval);
    const gameWon = makeMove(tileNum, playerID);
    const currentPlayerID = playerID; //having naming issues with passing objects that have the same property names - fix this
    // emit move to both players
    io.to(gameID).emit("tileclick", { tileNum, currentPlayerID });

    if (gameWon === true) {
      socket.emit("message", "NICE");
      io.to(gameID).emit("message", "TIC TAC TOE OVER");
      io.to(gameID).emit("gameUpdate", playerID); //change
      return;
    }

    game.updateLastPlayer(playerID);
    game.turnTimer(100);
  };

  socket.on("message", (text) => io.emit("message", text));
  socket.on("tileclick", onMove);
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

    let newGame = new Game(players[0], players[1], 2.0);
    players[0].join(newGame.gameID);
    players[1].join(newGame.gameID);
    gameArr.push(newGame);

    return newGame;
  }

  return null;
}

// start the game for the matched players
function startGame(game) {
  let secondTurn = Math.floor(Math.random() * 2);
  game.lastPlayer = game.players[secondTurn].id;
  //set up both players
  io.to(game.gameID).emit("startGame", game.gameID);
  game.turnTimer(100);
}

// finds the relevant game
function getGame(gameID) {
  console.log("looking for game:");
  let count = 0;
  let game = gameArr[count];
  // find the game that the current move happened in (this should be changed to be more efficient)
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
