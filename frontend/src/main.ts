import { io, Socket } from "socket.io-client";
import {
	ClientToServerEvents,
	ServerToClientEvents,
} from "@shared/types/SocketTypes";
import "./assets/scss/style.scss";
import { HighScore, MatchResult } from "@shared/types/Models";

const SOCKET_HOST = import.meta.env.VITE_SOCKET_HOST;

//logic for lobby-container ⭐️
// GETTING ALL THE ELEMENTS FROM HTML
const usernameInput = document.getElementById('username-input') as HTMLDivElement;
const waitingMessage = document.getElementById('waiting-message') as HTMLDivElement;
const lobbyContainer = document.getElementById('lobby-container') as HTMLElement;
const gameContainer = document.getElementById('game-container') as HTMLElement
const player_highscoreEl = document.querySelector("#player_highscore") as HTMLLIElement
const previous_listEl = document.querySelector("#match_result") as HTMLDivElement
const playerOneEl = document.getElementById("playerOne");
const playerTwoEl = document.getElementById("playerTwo");
const usernameInputEl = document.getElementById("username") as HTMLInputElement;
const usernameForm = document.getElementById("username-form") as HTMLFormElement;
const timerElement = document.getElementById('timer') as HTMLElement;
const player1ScoreEl = document.getElementById('player1Score') as HTMLElement;
const player2ScoreEl = document.getElementById('player2Score') as HTMLElement;
const player1ReactionTimeEl = document.querySelector("#player1ReactionTime") as HTMLElement
const player2ReactionTimeEl = document.querySelector("#player2ReactionTime") as HTMLElement
const resultContent = document.createElement('div');

let userId: string;
let playerName: string;

//start game ⭐️ 
function startGame() {

	if (lobbyContainer && gameContainer) {
		lobbyContainer.style.display = 'none';
		gameContainer.style.display = 'flex';
	}
}

// Connect to Socket.IO Server
console.log("Connecting to Socket.IO Server at:", SOCKET_HOST);
const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(SOCKET_HOST);



// Listen for when connection is established
socket.on("connect", () => {
	console.log("💥 Connected to the server", SOCKET_HOST);
	console.log("🔗 Socket ID:", socket.id);
	// Recive the highscore when connecting to the game
	socket.emit("reciveHighscore")
	socket.emit("reciveMatchResult")
});
socket.on("highScores", (highscore: HighScore) => {
	if (highscore) {
		const highscore_seconds = highscore.highscore / 1000
		player_highscoreEl.innerHTML = `${highscore.username}: ${highscore_seconds} sec`
	}
});
socket.on("matchResult", (matchResults: MatchResult[]) => {
	previous_listEl.innerHTML = ""
	matchResults.forEach(result => {
		const resultEl = document.createElement("ul")
		const createdAtData = new Date(result.createdAt!).toLocaleString()

		resultEl.classList.add("list-group", "match-result")

		const trophy = '<img src="img/trophy.png.png" style="width: auto; height: 1.5rem;">';

		let winner = '';
		if (result.player1_score > result.player2_score) {
			winner = result.player1_username;
		} else if (result.player2_score > result.player1_score) {
			winner = result.player2_username;
		}

		resultEl.innerHTML = `
            <li class="list-group-item">Match Date: ${createdAtData}</li>
            ${winner ? `<li class="list-group-item">${trophy}Winner: ${winner}${trophy}</li>` : `<li class="list-group-item">It's a tie!</li>`}
            <li class="list-group-item">${result.player1_username} finished with ${result.player1_score} point${result.player1_score !== 1 ? 's' : ''}!</li>
            <li class="list-group-item">${result.player2_username} finished with ${result.player2_score} point${result.player2_score !== 1 ? 's' : ''}!</li>
        `;
		previous_listEl.appendChild(resultEl)
	})
})

socket.on("userCreated", (user) => {
	userId = user.id
});
let readyRoom;
socket.on("readyRoom", (room) => {

	readyRoom = room;
	const player1 = readyRoom.users![0];
	const player2 = readyRoom.users![1];

	if (playerOneEl && playerTwoEl) {
		playerOneEl.innerText = player1.username;
		playerTwoEl.innerText = player2.username;
	}
	startGame()

});
socket.on("disconnected", () => {
	alert("The opponent has disconnected")
	window.location.reload()
})




// Listen for when server got tired of us
socket.on("disconnect", () => {
	console.log("💀 Disconnected from the server:", SOCKET_HOST);
});

// Listen for when we're reconnected (either due to our or the servers connection)
socket.io.on("reconnect", () => {
	console.log("🍽️ Reconnected to the server:", SOCKET_HOST);
	console.log("🔗 Socket ID:", socket.id);
});


// Event listener for entering a username
usernameForm.addEventListener("submit", (event) => {
	event.preventDefault();

	const username = usernameInputEl.value.trim();
	
	if (username.trim() !== '') {
		usernameInput.style.display = 'none';
		waitingMessage.style.display = 'block';
	} else {
		alert('enter a valid username');
		return
	}

	playerName = username

	socket.emit("createUser", username);
});

	let alienDisplayTime: number; // variabel to track the reaction time
	const maxAllowedReactionTime = 30000;

	// Handles 'place alien' from server

	socket.on('placeAlien', (data) => {
		// Placing the alien
		alienDisplayTime = performance.now();
		const x = data.x;
		const y = data.y;
		const alienImg = document.createElement('img');
		alienImg.src = '/img/AlienBild.png';
		alienImg.classList.add('alien-img');
		alienImg.style.gridRow = `${data.y}`;
		alienImg.style.gridColumn = `${data.x}`;
		alienImg.style.display = 'initial';
		alienImg.addEventListener('click', () => handleAlienClick(x, y));
		const gridContainer = document.getElementById('gridContainer');
		if (gridContainer) {
			gridContainer.appendChild(alienImg);
		}

		const timeoutId = setTimeout(() => {
			clearInterval(timerInterval);
			handleAlienClick(x, y)
		}, maxAllowedReactionTime);

		let startTime = performance.now();
		let timerInterval: number | undefined;

		function updateTimer() {
			const currentTime = performance.now();
			const elapsedTime = Math.min(currentTime - startTime, maxAllowedReactionTime);
			const seconds = Math.floor(elapsedTime / 1000);
			const milliseconds = Math.floor(elapsedTime % 1000);

			if (timerElement) {
				timerElement.innerHTML = `Hurry up! <br>${seconds}.${milliseconds}`;
			}
		}
		// Start the timer
		timerInterval = setInterval(updateTimer, 10);
		alienImg.addEventListener('click', () => {
			clearInterval(timerInterval); // Stop the timer when the alien is clicked
		});

		function handleAlienClick(x: number, y: number) {
			clearInterval(timerInterval);
			const reactionTime = performance.now() - alienDisplayTime;
			alienImg.style.display = 'none';
			socket.emit('alienClicked', { x, y, reactionTime, userId });
			clearTimeout(timeoutId)
		}
	});

	//update score section 
	socket.on('userScoreUpdated', (updatedUser) => {
		// Check if the updated user is player 1 or player 2
		if (updatedUser.id === readyRoom!.users[0].id) {
			// Update player 1's score
			if (player1ScoreEl) {
				player1ScoreEl.textContent = `${updatedUser.score}`;
			}
		} else if (updatedUser.id === readyRoom!.users[1].id) {
			// Update player 2's score
			if (player2ScoreEl) {
				player2ScoreEl.textContent = `${updatedUser.score}`;
			}
		}
	});
	socket.on("reactionTime", (user, reactionTime) => {
		const reaction_time = parseFloat((reactionTime / 1000).toFixed(2));
		if (user === readyRoom!.users[0].id) {
			// Update player 1's score

			player1ReactionTimeEl.innerHTML = `${reaction_time}`;
		} else if (user === readyRoom!.users[1].id) {
			// Update player 2's score

			player2ReactionTimeEl.innerHTML = `${reaction_time}`;
		}

	})

	socket.on('gameOver', () => {
		// Hide game
		if (gameContainer) {
			gameContainer.style.display = 'none';
		}

		const resultContainer = document.createElement('div');
		resultContainer.id = 'result-container';


		// Player names and scores
		const player1Name = document.getElementById('playerOne')?.innerText || 'Player 1';
		const player2Name = document.getElementById('playerTwo')?.innerText || 'Player 2';
		const player1Score = parseInt(document.getElementById('player1Score')?.textContent || '0');
		const player2Score = parseInt(document.getElementById('player2Score')?.textContent || '0');

		// Do the math and check who is the winner and the loser or if it's a tie
		let message;
		if (player1Score > player2Score) {
			message = `${player1Name} won this game against ${player2Name} by ${player1Score - player2Score} points.`;
		} else if (player2Score > player1Score) {
			message = `${player2Name} won this game against ${player1Name} by ${player2Score - player1Score} points.`;
		} else {
			message = `It's a tie! Both players scored ${player1Score} points.`;
		}

		// Display results for players
		resultContent.innerHTML = `
        <section id="gameover-container">
		<img id="img-ufo" src="/img/UFO.png" alt="UfO">
            <h1 class="gameover-h1">Game Over!</h1>
            <p class="gameover-text">${message}</p>
            <button class="playAgain-btn" >Play Again</button>
            <button class="gameover-btn">Exit</button>
        </section>
    `;

	const playAgainButton = resultContent.querySelector('.playAgain-btn');
    if (playAgainButton) {
        playAgainButton.addEventListener('click', () => {
            socket.emit("playAgain", userId, playerName)
            lobbyContainer.style.display = "block"
            waitingMessage.style.display = 'block';
            resultContainer.style.display = "none"
            clearFields()
        });
    }
    const exitButton = resultContent.querySelector('.gameover-btn');
    if (exitButton) {
        exitButton.addEventListener('click', () => {
            window.location.reload()
            clearFields()
        });
    }
    const clearFields = () => {
        timerElement.innerHTML = "You have 30 seconds.."
        player1ReactionTimeEl.innerHTML = "0 seconds"
        player2ReactionTimeEl.innerHTML = "0 seconds"
        player1ScoreEl.innerHTML = "0"
        player2ScoreEl.innerHTML = "0"
    }
 
    resultContainer.appendChild(resultContent);
    document.body.appendChild(resultContainer);
});