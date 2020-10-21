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
    if(game.board.alreadyClicked(tileNum)) return;
    if (game.currentPlayer !== socket.id) return;
    // compute move
    clearInterval(game.timeInterval);
    const gameWon = game.board.makeMove(tileNum, socket.id);
    // emit move to both players
    io.to(game.gameID).emit("tileClick", { tileNum, currentPlayerID: socket.id});

    if (gameWon === true) {
      socket.emit("message", "NICE");
      io.to(game.gameID).emit("message", "TIC TAC TOE OVER");
      io.to(game.gameID).emit("gameUpdate", socket.id); //change
      return;
    } else if (game.board.isDraw()) {
      console.log(game.board.isDraw());
      io.to(game.gameID).emit("game0XDraw", socket.id); //change
      return;
    }

    game.updateTurns();
    update0XDuel(game, 100);
  };

  const aimClick = ({timeTaken, gameID}) => {
    let game = activeGames[gameID];

    if (game.currentPlayer === socket.id) {
      game.aimDuel.setAtkReaction(timeTaken);  //attacker
    } else {
      game.aimDuel.setDefReaction(timeTaken);  //defender
    }

    if (game.aimDuel.bothClicked()) {     // CANNOT END TURN AFTER RECEIVING FIRST CLICK IN CASE OF LATENCY
      console.log("both clicked");
      clearInterval(game.timeInterval);
     
      if (game.aimDuel.attackSuccess()) {
        // decrease health bar
        game.updateHealth(game.lastPlayer, -10);
       // game.attackAnimation(attacker, "aim");
      }

      game.updateTurns();
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
      io.to(game.gameID).emit("startGame");
    }
  });
  socket.on("startNextMode", (gameID) => {
    let game = activeGames[gameID];
    game.playersReady++;

    if (game.playersReady === 2) {
      if (game.roundCount % 2 === 0){
        console.log("starting aim game");
        game.playersReady = 0;

        let numTurns = 10 + Math.floor(Math.random() * 10);
        if (numTurns % 2 === 1) numTurns++;
        game.aimDuel.initAimDuel(10, 40, 900, 804); 
        
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


// UPDATE HEALTH 
//game.players[0].conn.emit("updateHealth", {id: player.id, hp: player.health}); 
//game.players[1].conn.emit("updateHealth", {id: player.id, hp: player.health}); 

// ############################ NOUGHTS AND CROSSES ############################
function update0XDuel(game, timeStep) {
  game.timeLeft = game.turnTime;  // ########################################

  game.timeInterval = setInterval(
    function () {

      io.to(game.gameID).emit("turnUpdate0X", {
        turnNow: game.currentPlayer,
        time: game.timeLeft,
      });

      game.timeLeft -= timeStep;

      if (game.timeLeft < 0) {
        clearInterval(game.timeInterval);
        io.to(game.gameID).emit("gameUpdate", game.lastPlayer);
        game.updateTurns();  // ??????????????/
        game.board.clear();  //clear board
      }
      console.log("time left: " + game.timeLeft);
    },
    timeStep
  );
}
// ############################## aim game ######################


function updateAimDuel(game) {
  console.log(game.players[game.lastPlayer].health);
  console.log(game.players[game.currentPlayer].health);
  game.aimDuel.resetReactions();

  if (game.aimDuel.duelOver()) {
    console.log("aim duel over");
    game.roundCount++;
    // need to randomise next game
    let fromMode = "aim-game";       // implement game.currentMode
    let toMode = "tictac-game";
    io.to(game.gameID).emit("startNextMode", {fromMode, toMode});
    return;
  }
   
  let coords = game.aimDuel.getCoords();
  io.to(game.gameID).emit("turnUpdateAim", {
    attacking: game.currentPlayer,
    coords: coords,
    btnWidth: game.aimDuel.getAimBtnWidth(),
  }); 

  game.timeInterval = setTimeout(function() {
    // will only reach this point if only 1 player has clicked in time
    if (game.aimDuel.getAtkReaction()) {
      //attack success
      game.updateHealth(game.lastPlayer, -10);
    } 

    game.updateTurns();
    updateAimDuel(game);
  }, 2000);
  
}

// finds the relevant game

// emit turnUpdate, true/false
// on true, display timer on client side
// server room emit interval updates
// on click does turnUpdate
// if timer runs out, endGame



