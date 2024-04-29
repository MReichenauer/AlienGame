/**
 * Socket Controller
 */
import Debug from "debug";
import { Server, Socket } from "socket.io";
import { ClientToServerEvents, ServerToClientEvents, randomAlien } from "@shared/types/SocketTypes";
import prisma from "../prisma";
import { createUser, deleteRoom, updateUser, updateUserRoom, userGameRoom } from "../services/user_services";
import { GameRound } from "@prisma/client";
import { createNewRoom, findOneRoomWithUsers, findRoomWithOneUserOnly, findRoomWithUsers } from "../services/gameRoom_services";
import { storeReactionTime } from "../services/gameRound.services";
import { createHighscore, fastestHighscore } from "../services/highScore_services";
import { createMatchResult, findMatchResults } from "../services/matchResult_services";

// Create a new debug instance
const debug = Debug("backend:socket_controller");

//Global variables that we need for now
let alienPosition: randomAlien;
let clickedSocketIds: { [roomId: string]: string[] } = {};
let roomId: string;
// Handle a user connecting
export const handleConnection = (
	socket: Socket<ClientToServerEvents, ServerToClientEvents>,
	io: Server<ClientToServerEvents, ServerToClientEvents>
) => {
	//debug("🙋 A user connected", socket.id);

	socket.on("reciveHighscore", async ()=>{
		await findAndEmitHighscore()
	})
	socket.on("reciveMatchResult", async () => {
		await findAndEmitMatchResult()
	})

	// Handle creatUser
	socket.on("createUser", async (username) => {
		try {
			// Create a user in the database
			const user = await createUser({
				id: socket.id,
				username: username,
				gameRoomId: null,
				score: 0

			});
			const roomWithOneUser = await findRoomWithOneUserOnly()
			if (roomWithOneUser) {
				await userJoinRoom(user.id, roomWithOneUser.id)
			} else {
				const newRoom = await createNewRoom({ name: "Game Room" })
				await userJoinRoom(user.id, newRoom.id)
			}
			//debug("Here is the user with the joined room", user)
			// Emit success with user data
			socket.emit("userCreated", user);
		} catch (error) {
			//debug('Error creating user:', error);
		}
	});

	// Handle user disconnecting
	socket.on("disconnect", async () => {
		debug("User disconnected:", socket.id);
	});


	const userJoinRoom = async (userId: string, roomId: string) => {
		const joinRoom = await updateUserRoom(userId, roomId)
		socket.emit("userJoinedRoom", userId)
		const roomToPlay = await findOneRoomWithUsers(roomId)
		if (!roomToPlay) {
			throw new Error("Room is not found")
		}
		if (roomToPlay.users.length === 2) {
			roomToPlay.users.forEach(user => {
				io.to(user.id).emit("readyRoom", roomToPlay)
			})
			sendNextAlien(socket)
		}
	}
	/**
	 * Game Handler
	 */

	const maxAllowedReactionTime = 30000;

	// listen for 'alien clicked'
    socket.on('alienClicked', async (data: { x: number; y: number; reactionTime: number, userId: string }) => {
		// Get the user ID from the received data
		alienCounter++;
		debug("Alien Counter in the alien CLICKED", alienCounter)
        const userId = data.userId;

        // Get the room ID based on the user ID
        const readyRoom = await userGameRoom(userId);
        const roomId = readyRoom!.gameRoomId!;

        // Find users in the room
        const usersInRoom = await findOneRoomWithUsers(roomId);

        // Get the reaction time from received data
        const reactionTime = data.reactionTime;

        // Store the reaction time in the database
        await storeReactionTime({
			reaction_time: reactionTime,
            userId: userId
        });

        // Add the clickedSocketIds array for the room if it doesnt exist
        if (!clickedSocketIds[roomId]) {
            clickedSocketIds[roomId] = [];
        }

        // Add the users socket ID to the rooms array
        clickedSocketIds[roomId].push(userId);

        // Emit the reaction time to all users in the room
        usersInRoom?.users.forEach(user => {
            io.to(user.id).emit("reactionTime", userId, reactionTime);
        });

        // Increment the alien counter for THIS room

        // If only one user has clicked and the reaction time is within the allowed limit, update the player score
        if (clickedSocketIds[roomId].length === 1 && reactionTime < maxAllowedReactionTime) {
            updatePlayerScore(userId, reactionTime, maxAllowedReactionTime);
        }

        // If both users in the room have clicked, send the next alien and clear the array for the next round
        if (clickedSocketIds[roomId].length === 2) {
            // Two users have clicked, send the next alien
            sendNextAlien(socket);
            // Clear the array for the next round
            clickedSocketIds[roomId] = [];
            // Reset the alien counter for this room
        }
    });

	const calculateScore = (reactionTime: number, maxAllowedReactionTime: number): number => {
		// ge poäng endast om reactionTime är mindre än eller lika med maxAllowedReactionTime
		if (reactionTime <= maxAllowedReactionTime) {
			return 1;
		} else {
			return 0;
		}

	};


	const updatePlayerScore = async (userId: string, reactionTime: number, maxAllowedReactionTime: number) => {
		try {

			const calculatedScore = calculateScore(reactionTime, maxAllowedReactionTime);

			const user = await prisma.user.update({
				where: { id: userId },
				data: { score: { increment: calculatedScore } }
			});
			const usersInRoom = await findOneRoomWithUsers(user.gameRoomId!)


			if (user.gameRoomId) {
				// Emit the updated user score to all players in the room
				usersInRoom?.users.forEach(user1 => {
					io.to(user1.id).emit('userScoreUpdated', {
						id: user.id,
						username: user.username,
						gameRoomId: user.gameRoomId,
						score: user.score,
					});
				})
			}
		} catch (error) {
			console.error("Error updating player score:", error);
		}
	};

	function getRandomPosition() {
		const x = Math.floor(Math.random() * 10);
		const y = Math.floor(Math.random() * 10);
		const delay = Math.floor(Math.random() * 3000) + 1000;
		return { x, y, delay };
	}

	let initialDelay: number = Math.floor(Math.random() * 2000) + 1000; // Generate initial random delay

	let alienCounter = 0;
	// function to add next alien in game section and randomize the delay
	const sendNextAlien = async (socket: Socket) => {


		const userId = socket.id

		const theRoom = await userGameRoom(userId)
		const usersInRoom = await findOneRoomWithUsers(theRoom?.gameRoomId!)

		alienPosition = getRandomPosition();

			const currentTimestamp = Date.now();
			// calculates the delay beffor spawning the alien and ensures they dont spawn instantly after ech round
			const delay = alienPosition.delay - (currentTimestamp % alienPosition.delay) + initialDelay;


			const sendAlienTimeout = setTimeout(() => {
				usersInRoom?.users.forEach(user => {
					io.to(user.id).emit("placeAlien", alienPosition)
				});
			}, delay);
			if(alienCounter === 10) {
				if (theRoom?.gameRoomId) {
					await storeHighscore(theRoom.gameRoomId)
					await storeGameResult(theRoom.gameRoomId)
					deleteRoom(theRoom.gameRoomId);
					clearTimeout(sendAlienTimeout)
				}
				// game over
				alienCounter = 0;
				usersInRoom?.users.forEach(user => {
					io.to(user.id).emit("gameOver")
				});
			}
	};
	const storeHighscore = async (roomId: string) => {
		if(!roomId){
			return;
		}
		const users = await findRoomWithUsers(roomId)
		if(!users){
			return;
		}
		for (let i = 0; i < users.length; i++) {
			const user = users[i];
			const reaction_time = user.gemeRound
			const sumOfAllReactionTimes = calculateReactionTimes(reaction_time)
			const userHighScore = sumOfAllReactionTimes / 2;
			const highscore = await createHighscore({
				username:user.username,
				userId:user.id,
				highscore:userHighScore
			})

		}
		await findAndEmitHighscore()

	}
	const calculateReactionTimes = (reactionTimes:GameRound[]) => {
		let sum = 0;
		reactionTimes.forEach(reaction =>{
			sum += reaction.reaction_time
		})
		return sum;
	}

	const findAndEmitHighscore = async () =>{
		const highscore =  await fastestHighscore()
		if(!highscore){
			return null;
		}
	io.emit("highScores", highscore)
	}

	const findAndEmitMatchResult = async () => {
		const result = await findMatchResults()
		io.emit("matchResult", result)
	}

	const storeGameResult = async (roomId:string) => {
		const user = await findRoomWithUsers(roomId)
		if(!user){
			return;
		}
		const date = new Date()
		const player1 = user[0]
		const player2 = user[1]
		const player1Score = player1.score ?? 0 // default to 0 if it is "null"
		const player2Score = player2.score ?? 0 // default to 0 if it is "null"
		const result = await createMatchResult({
			player1_username:player1.username,
			player1_score:player1Score,
			player2_username:player2.username,
			player2_score:player2Score,
		})
		await findAndEmitMatchResult()
	}

	socket.on("playAgain", async (userId, username) => {
		const socketId = userId
		try {
			// Create a user in the database
			const user = await updateUser(socketId,{
				username: username,
				gameRoomId: null,
				score: 0

			});
			const roomWithOneUser = await findRoomWithOneUserOnly()
			if (roomWithOneUser) {
				await userJoinRoom(user.id, roomWithOneUser.id)
				alienCounter = 0;
				debug("THIS IS THE ALIEN COUNTER WHEN THE USER PLAYS AGAIN 🚘🚘🚘", alienCounter)
			} else {
				const newRoom = await createNewRoom({ name: "Game Room" })
				alienCounter = 0;
				await userJoinRoom(user.id, newRoom.id)
			}
			// Emit success with user data
			socket.emit("userCreated", user);
		} catch (error) {
			debug('Error creating user:', error);
		}

	})
	socket.on("disconnect", async () => {
		debug("The user has disconnected", socket.id)
		const theRoom = await userGameRoom(socket.id)
		debug("This is the room where the user disconnected", theRoom)
		if(!theRoom){
			debug("No room found returning")
			return;
		}
		if(!theRoom.gameRoomId){
			debug("there is no gameRoomId")
			return;
		}
		const usersInRoom = await findOneRoomWithUsers(theRoom?.gameRoomId)
		if(!usersInRoom){
			debug("No users found")
			return;
		}
		usersInRoom?.users.forEach(user => {
			io.to(user.id).emit("disconnected")
		})
		await deleteRoom(theRoom?.gameRoomId)
	})
};
