/*
function Game() {
	this.tileTable = [[-1, -2, -3], [-4, -5, -6], [-7, -8, -9]];
	this.tiles = document.querySelectorAll('.tile');
	this.gameFin = false;

}

Game.prototype.init = function() {
	for (let i = 0; i < this.tiles.length; i++) {
		this.tiles[i].addEventListener('click', function() {
			if (this.gameFin === true) return;
			//display to user that tile was clicked and change tileTable accordingly
			this.classList.add('tile-clicked');
			this.tileTable[Math.floor(i / 3)][i % 3] = 1;

			if (//horizontal cases
				this.tileTable[0][0] === this.tileTable[0][1] && this.tileTable[0][1] === this.tileTable[0][2] || 
				this.tileTable[1][0] === this.tileTable[1][1] && this.tileTable[1][1] === this.tileTable[1][2] ||
				this.tileTable[2][0] === this.tileTable[2][1] && this.tileTable[2][1] === this.tileTable[2][2] ||
				//vertical cases
				this.tileTable[0][0] === this.tileTable[1][0] && this.tileTable[1][0] === this.tileTable[2][0] ||
				this.tileTable[0][1] === this.tileTable[1][1] && this.tileTable[1][1] === this.tileTable[2][1] ||
				this.tileTable[0][2] === this.tileTable[1][2] && this.tileTable[1][2] === this.tileTable[2][2] ||
				//diagonal cases
				this.tileTable[0][0] === this.tileTable[1][1] && this.tileTable[1][1] === this.tileTable[2][2] ||
				this.tileTable[0][2] === this.tileTable[1][1] && this.tileTable[1][1] === this.tileTable[2][0]
				) {
					console.log("game over");
					this.gameOver(true);
			}
			
		})
	}
};

Game.prototype.

*/

//###################################################################### TICTAC ######################################################################
let tileTable, tiles, gameFin;

const sock = io();
init();

function init() {
	tileTable = [[-1, -2, -3], [-4, -5, -6], [-7, -8, -9]];
	tiles = document.querySelectorAll('.tile');
	gameFin = false;

	for (let i = 0; i < tiles.length; i++) {
		tiles[i].addEventListener('click', function() {
			console.log(i);
			if (gameFin === true) return;
			//display to user that tile was clicked and change tileTable accordingly
			sock.emit('tileclick', i);
			this.classList.add('tile-clicked');
			tileTable[Math.floor(i / 3)][i % 3] = 1;
			checkWinLose();
		})
	}
}

function checkWinLose() {
	if (//horizontal cases
		tileTable[0][0] === tileTable[0][1] && tileTable[0][1] === tileTable[0][2] || 
		tileTable[1][0] === tileTable[1][1] && tileTable[1][1] === tileTable[1][2] ||
		tileTable[2][0] === tileTable[2][1] && tileTable[2][1] === tileTable[2][2] ||
		//vertical cases
		tileTable[0][0] === tileTable[1][0] && tileTable[1][0] === tileTable[2][0] ||
		tileTable[0][1] === tileTable[1][1] && tileTable[1][1] === tileTable[2][1] ||
		tileTable[0][2] === tileTable[1][2] && tileTable[1][2] === tileTable[2][2] ||
		//diagonal cases
		tileTable[0][0] === tileTable[1][1] && tileTable[1][1] === tileTable[2][2] ||
		tileTable[0][2] === tileTable[1][1] && tileTable[1][1] === tileTable[2][0]
		) {
			console.log("game over");
			goodGame(true);
	}
}

function goodGame(win) {
	let resultClass;
	gameFin = true;

	if (win === true){
		resultClass = 'winner-pov';
	} else {
		resultClass = 'loser-pov';
	}
	sock.emit('message', 'Game over');
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

  sock.on('message', log);

  document
    .querySelector('#chat-form')
	.addEventListener('submit', onChatSubmitted(sock));

sock.on('tileclick', () => {

} );

//###################################################################### TICTAC ######################################################################

//###################################################################### AIM ######################################################################






















//###################################################################### AIM ######################################################################