let tileTable, tiles, gameFin;

init();




function init() {
	tileTable = [[-1, -2, -3], [-4, -5, -6], [-7, -8, -9]];
	tiles = document.querySelectorAll('.tile');
	gameFin = false;

	for (let i = 0; i < tiles.length; i++) {
		tiles[i].addEventListener('click', function() {
			if (gameFin === true) return;
			//display to user that tile was clicked and change tileTable accordingly
			this.classList.add('tile-clicked');
			tileTable[Math.floor(i / 3)][i % 3] = 1;

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
					console.log("gameover");
					gameOver(true);
			}
			
		})
	}
}


function gameOver(win) {
	let resultClass;
	gameFin = true;

	if (win === true){
		resultClass = '#winner-pov';
	} else {
		resultClass = '#loser-pov';
	}

	gameOverFlash(resultClass, 3);
}

function gameOverFlash(classToggle, count) {
	let counter = 0;
	
	setTimeout(function flash() { 
		for (let i = 0; i < tiles.length; i++) {
			tiles[i].classList.toggle(classToggle);
		}
		counter++;
		if (counter < count) {
			setTimeout(flash(), 1000);
		}

	}, 1000);
}