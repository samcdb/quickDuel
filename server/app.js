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
const sentenceBank = [
  "please type this sentence ok nice",
  "here is another sentence please type",
  "by all that is holy I summon fishmoly"
];
console.log(`Serving static from ${clientPath}`);


server.on("error", (err) => {
  console.error(err);
});

server.listen(port, () => {
  console.log("server launched");
});

// socket connects => lookforgame => app emits foundGame => client onfoundgame emits startnextmode => app starts next mode => 

io.on("connection", (socket) => {
  const lobby = "lobby";
  socket.emit("sessionInit", socket.id);
  socket.emit("message", "You are connected");
  console.log("a client has connected");

  socket.join(lobby);
  lookForGame(lobby);

  const reactClick = ({timeTaken, gameID}) => {
    let game = activeGames[gameID];
    if(!game.reactDuel.isClickAllowed()|| game.reactDuel.alreadyClicked(socket.id)) return;

    game.playersReady++;
    game.reactDuel.setPlayerTime(socket.id, timeTaken);
    game.reactDuel.setAllowClick(false);

    if (game.playersReady === 2){
      clearInterval(game.timeInterval);

      let winningPlayer = game.reactDuel.getWinner();
      game.currentplayer = winningPlayer;
      game.lastPlayer = Object.keys(game.players)[0] === game.currentPlayer ? Object.keys(game.players)[1] : Object.keys(game.players)[0];

      io.to(game.gameID).emit("gameReactOver", winningPlayer);
    }
  };
  
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
      updateHealth(game, game.currentPlayer, 20);
      socket.emit("message", "NICE");
      game.roundCount++;
      io.to(game.gameID).emit("game0Xover", socket.id); //change
      return;
    }
     else if (game.board.isDraw()) {
      console.log(game.board.isDraw());
      io.to(game.gameID).emit("game0Xover", null); //change
      return;
    }

    game.updateTurns();
    update0XDuel(game);
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
        updateHealth(game, game.lastPlayer, -10);
       // game.attackAnimation(attacker, "aim");
      }

      game.updateTurns();
      updateAimDuel(game);
    }
  };

  const textInput = ({typedText, gameID}) => {
    let game = activeGames[gameID];
    updateTypeDuel(typedText, socket.id, game);
  };

  socket.on("message", (text) => io.emit("message", text));
  socket.on("tileClick", tileClick);
  socket.on("aimClick", aimClick);
  socket.on("reactClick", reactClick);
  socket.on("textInput", textInput);
  socket.on("startNextMode", (gameID) => {
    let game = activeGames[gameID];
    game.playersReady++;
    
    if (game.playersReady === 2) {
      startNextMode(game);
    }
  });

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
    
    console.log("found a game with id: " + newGame.gameID);
    io.to(newGame.gameID).emit('foundGame', newGame.gameID);
  }
  
}

function updateReactDuel(game) {
  game.timeInterval = setTimeout(() => {           
    io.to(game.gameID).emit("turnUpdateReact");
    game.reactDuel.setAllowClick(true);

    game.timeInterval = setTimeout(() => {
      let winningPlayer = game.reactDuel.getWinner();
      console.log("winner: "+ winningPlayer);
      game.currentPlayer = winningPlayer;
      game.lastPlayer = Object.keys(game.players)[0] === game.currentPlayer ? Object.keys(game.players)[1] : Object.keys(game.players)[0];
      
      console.log("current: " + game.currentPlayer);
      console.log(game.lastPlayer);
      io.to(game.gameID).emit("gameReactOver", winningPlayer);
    }, 2000);
  }, game.reactDuel.createRandomTime());
} 

function update0XDuel(game) { 
   game.board.resetTurnTime();

  game.timeInterval = setInterval(() => {
      io.to(game.gameID).emit("turnUpdate0X", {
        turnNow: game.currentPlayer,
        time: game.board.getTimeLeft(),
      });

     game.board.updateTimeLeft();

      if (game.board.getTimeLeft() < 0) {
        clearInterval(game.timeInterval); 
        updateHealth(game, game.lastPlayer, 20);
        io.to(game.gameID).emit("game0Xover", game.lastPlayer);
        game.updateTurns();  
        game.board.clear();
      }
    },
    game.board.getTimeStep()                 
  );
}


function updateAimDuel(game) {
  game.aimDuel.resetReactions();

  if (game.aimDuel.duelOver()) {
    console.log("aim duel over");
    startNextMode(game);
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
      updateHealth(game, game.lastPlayer, -10);
    } 

    game.updateTurns();
    updateAimDuel(game);
  }, game.aimDuel.getTurnTime());
};

function startTypeDuel(game) {
  io.to(game.gameID).emit("startTypeDuel", game.typeDuel.randomSentence(sentenceBank))
  game.timeInterval = setTimeout(() => {
    startNextMode(game);
  }, game.typeDuel.getTurnTime());
}

function updateTypeDuel(typedText, playerID, game) {
  if (game.typeDuel.duelOver()) return;
  io.to(game.gameID).emit("turnUpdateType", {typedText, playerID});

  if (game.typeDuel.duelOver(typedText)) {
    io.to(game.gameID).emit("typeDuelOver", playerID); // start shooting animation
      // wait for players ready then do health update
    let damagedPlayerID = game.getOtherPlayer(playerID);
    updateHealth(game, damagedPlayerID, -30);
  }
};

function updateHealth(game, id, hpChange) {
  let player = game.players[id];
  player.health += hpChange;
  if (player.health <= 0) console.log("game over");
  if (player.health > player.maxHealth) player.health = player.maxHealth;
  io.to(game.gameID).emit("updateHealth", {id, hp: player.health});

}

function startNextMode(game) {
  const fromMode = game.currentMode;      
  let toMode;
  console.log("roundCount " + game.roundCount);
  switch(true) {
    case game.roundCount === -1:
      toMode = game.gameModes[1]  // game over
      break;

    case game.roundCount === 0:
      toMode = game.gameModes[2]; // go from waiting screen to start-decider
      updateReactDuel(game);
      break;

    case game.roundCount % 2 === 1:
      toMode = game.gameModes[3];  // go to aim-game

      let numTurns = 10 + Math.floor(Math.random() * 10);
      if (numTurns % 2 === 1) numTurns++; //make numTurns even

      game.aimDuel.initAimDuel(numTurns, 40, 900, 804, 1000); 
      updateAimDuel(game);
      break;
    
    default:    //choose random other game
      let randomMode = 4 + Math.floor(Math.random() * (game.gameModes.length - 4));
      toMode = game.gameModes[randomMode];
    
      switch(toMode) {
        case game.gameModes[4]: //noughts and crosses
          update0XDuel(game, 100);  
          break;
        
        case game.gameModes[5]: //typing game
          startTypeDuel(game);
          break;

      // add more games
    }
  }

  console.log(`from: ${fromMode} to: ${toMode}`);

  game.roundCount++;
  game.currentMode = toMode;
  game.playersReady = 0;
  io.to(game.gameID).emit("startNextMode", {fromMode, toMode});
}


