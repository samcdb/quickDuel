
const createTicTacToe = (sock) => {
	let tiles;

	const init = () => {
		tiles = document.querySelectorAll('.tile');
		return tiles;
	}

	function goodGame(win) {
		let resultClass;

		if (win === true){
			resultClass = 'winner-pov';
		} else {
			resultClass = 'loser-pov';
		}
		gameOverFlash(resultClass, 3);
	}

	function gameOverFlash(classToggle, count) {
		
		setTimeout(function() { 
			for (let i = 0; i < tiles.length; i++) {
				tiles[i].classList.toggle(classToggle);
			}
			
			if (count > 0) {
				gameOverFlash(classToggle, count - 1);
				console.log(count);
			}

		}, 400);
	}

	return { init, goodGame };
};

const onChatSubmitted = (sock) => (e) => {
	e.preventDefault();
	  
	const input = document.querySelector('#chat');
	const text = input.value;
	input.value = '';
	  
	sock.emit('message', text);
 };

const log = (text) => {
	console.log('This is the text that was passed in: ' + text);
	const parent = document.querySelector('#events');
	const el = document.createElement('li');
	el.innerHTML = text;
  
	parent.appendChild(el);
	parent.scrollTop = parent.scrollHeight;
  };



(() => {

	const sock = io();
	let playerID;
	const { init, goodGame } = createTicTacToe();
	const tiles = init();

	sock.on('message', log);

	sock.on('sessionInit', (myID) => {
		init(sock, myID, tiles)
		console.log("ïn session init tiles: " + tiles);
		playerID = myID;
		console.log(myID);
	});

	sock.on('tileclick', ({tileNum, currentPlayerID}) => {
		console.log("client ID = " + playerID + " received = " + currentPlayerID)
		console.log("tile: " + tileNum);
		console.log("tiles: " + tiles.length);
		if (playerID === currentPlayerID) {
			tiles[tileNum].classList.add('tile-clicked');
		} else {
			tiles[tileNum].classList.add('enemy-tile-clicked');
		}
	});
	
	sock.on('gameUpdate', (moveID) => {
		if (playerID === moveID) {
			goodGame(true);
		} else {
			goodGame(false);
		}
	});

	sock.on('startGame', (text) => {
		console.log('players starting game');
		document.getElementById("screen-tictac").style.display = "block";
		document.getElementById("screen-lobby").style.display = "none";
		console.log(text);
	});

	for (let i = 0; i < tiles.length; i++) {
		tiles[i].addEventListener('click', function() {
			console.log(i);
			const tileNum = i;
			//display to user that tile was clicked and change tileTable accordingly
			sock.emit('tileclick', {tileNum, playerID});
		})
	}

	document
    .querySelector('#chat-form')
	.addEventListener('submit', onChatSubmitted(sock));
	
})();
























//###################################################################### AIM ######################################################################