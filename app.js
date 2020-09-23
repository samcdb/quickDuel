let express = require('express');
let app = express();

const port = 3000;
const ip = '127.0.0.1';

app.set('view engine', 'ejs');

app.get('/', function(req, res){
    res.render('home');
});

app.listen(port, ip, function(){
    console.log('server started');
});