# AlienGame

## Project Overview
### This was a school assignment (group), with the following breef:
You will create a simple 2-player real-time game where the goal is to click on a virus as quickly as possible to erase it, and points are awarded to the player with the fastest reaction time.

### Game Setup
1. Start Game – Wait for an opponent.
2. Player Join – When players have joined, start the game.
3. Random Position & Delay – The server randomly generates an x/y position with a random delay (1.5–10 seconds) before displaying it.
4. Measure Reaction Time – Record each player's reaction time. If a player hasn't clicked after 30 seconds, register a click with a reaction time of 30 seconds.
5. Post Results – Send the result to the server, which determines who gets the point.
6. Round Loop – If 10 rounds have not yet been played, return to step 3.
7. End of Game – Once 10 rounds have been played, display the scores and indicate which player won. Ensure that a tie is also handled appropriately.

### Requierments
* User's should be able to chose their nickname.
* All calculations for the virus's position, determining who receives points, current score, etc., should be performed on the server side.
* In each game round, the virus must appear at the same position simultaneously for both players.
* Display the timer, the most recent reaction time, and the opponent’s most recent reaction time.
* Multiple games should be able to run concurrently. When a player connects, a message such as “Waiting for another player…” should be shown. As soon as two players are connected, a round starts.
* The high score (fastest average reaction time) and the results of the last 10 matches should be stored in a database and displayed in a lobby when entering the game. The statistics must be updated in real time.
#### Technical
* Use Node.js, TypeScript, Socket.IO, Prisma, and MongoDB.
* Version controled with Git (feature-branches).
* Responsive (mobile first).


### How to run project locally
1. Clone reprository.
2. Create a .env in the back-end folder follow the structure of .env.example with your own credentials.
3. Create a .env in the front-end folder follow the structure of .env.example with your own credentials.
4. Run `npm i` in the back-end folder.
5. Run `npm i` in the front-end folder.
6. Run `npm run start` in the back-end folder.
7. Run `npm run dev` in the front-end folder.

![start](https://github.com/user-attachments/assets/db1993d1-5c17-4a47-8dfd-353c1d1a7a0b)
![waitingToPlay](https://github.com/user-attachments/assets/b3c21d1f-8a91-4b5a-b78e-9c4af0dab1e8)
![duringGame](https://github.com/user-attachments/assets/19d8f0b2-e564-4589-8a59-16bc0d20b8c6)
![whenGameIsDone](https://github.com/user-attachments/assets/73aa9a49-e07b-4950-9bf2-4caeaf365879)
