const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const socketio = require('socket.io');
const createBoard = require('./create-board');
const createTurnRules = require('./create-TurnRules');
const app = express();

const clientPath = `${__dirname}/../client`;
const port = 8080;
const ip = '127.0.0.1';


app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(clientPath));

const server = http.createServer(app);
const { makeMove, getBoard, clear } = createBoard();
const { } = createTurnRules();
const io = socketio(server);

console.log(`Serving static from ${clientPath}`);

server.on('error', (err) => {
    console.error(err)
})

server.listen(port, () => {
    console.log('server launched')
}); 



io.on('connection', (socket) => {
    const lobby = "lobby"
    const duelRoom = 'duelRoom';

    socket.emit('sessionInit', socket.id);
    socket.emit('message','You are connected');
    console.log('a client has connected');

    socket.join(lobby);
    //io.sockets.adapter.rooms[duelRoom].length
    //console.log(io.sockets.adapter.rooms[duelRoom].length);
    lookForGame(lobby, duelRoom);

    const onMove = ({tileNum, playerID}) => {
        console.log(tileNum + " " + playerID);
        const gameWon = makeMove(tileNum, playerID);
        const currentPlayerID = playerID;       //having naming issues with passing objects that have the same property names - fix this

        io.to(duelRoom).emit('tileclick', {tileNum, currentPlayerID});
    
        if (gameWon === true) {
            socket.emit('message', 'NICE');
            io.to(duelRoom).emit('message','TIC TAC TOE OVER');
            io.to(duelRoom).emit('gameUpdate', playerID);
        }
    };

    socket.on('message', (text) => io.emit('message', text));
    socket.on('tileclick', onMove);
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

function lookForGame(lobby, game) {
    const players = getClientsInRoom(lobby);
    console.log(players.length);

    if (players.length >= 2) {
        console.log('2 players ready for game');
        players[0].leave(lobby);
        players[1].leave(lobby);
        players[0].join(game);
        players[1].join(game);
        
        io.to(game).emit('startGame',12345);
    }
}


