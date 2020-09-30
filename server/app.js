const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const socketio = require('socket.io');
const app = express();

const clientPath = `${__dirname}/../client`;
const port = 8080;
const ip = '127.0.0.1';

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(clientPath));




const server = http.createServer(app);
const io = socketio(server);

console.log(`Serving static from ${clientPath}`);

server.on('error', (err) => {
    console.error(err)
})
server.listen(port, () => {
    console.log('server launched')
}); 

io.on('connection', (socket) => {
    console.log('a client has connected');
    socket.emit('message','You are connected');
    /*
    socket.on('message', (text) => {
        socket.emit('message', text); 
    });*/
});


/*
app.set('view engine', 'ejs');

app.get('/', function(req, res){
    res.render('home');
});

app.get('/game', function(req, res){
    res.render('game');
});

app.post('/pressbtn', function(req, res){
    res.send('posted');
})

app.listen(port, ip, function(){
    console.log('server started');
}); */