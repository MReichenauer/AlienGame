export {}
import { HighScore, MatchResult, Room, User} from "./Models"

// Events emitted by the server to the client
export interface ServerToClientEvents {
    userJoined: (username: string, timestamp: number) => void;
    userCreated: (user: User) => void;
    roomCreated: (room: Room) => void;
    userJoinedRoom: (userId: string) => void;
    roomWithOneUser: (users: Room) => void;
    readyRoom: (room:Room) => void;
    placeAlien: (data: randomAlien) => void;
    gameOver: () => void;
    userScoreUpdated: (updatedUser: User) => void;
    reactionTime: (userId:string, reactionTime:number) => void
    highScores : (allHighscores: HighScore) => void;
    matchResult: (result:MatchResult[]) => void;
    disconnected: () => void;
}

// Events emitted by the client to the server
export interface ClientToServerEvents {
    userJoinRequest: (username: string, roomId: string, callback: (response: UserJoinResponse) => void) => void;
    getRoomList: (callback: (rooms: Room[]) => void) => void;
    createUser: (username: string) => void;
    userCreated: (user: User) => void;
    createRoom: (room: CreateNewRoom) => void;
    userJoinRoom: (userId: string, roomId: string) => void;
    findRoom: () => void;
    roomReadyToPlay : (roomId : string) => void;
    startGame: () => void;
    alienClicked: (data: { x: number; y: number; reactionTime: number; userId: string }) => void;
    updateUserScore: (newScore: number) => void;
    reciveHighscore: () => void;
    reciveMatchResult: () => void;
    playAgain: (userId:string, username:string) => void;
}

export interface RoomWithUsers extends Room {
    users: User[];
}

// User join response
export interface UserJoinResponse {
    success: boolean;
    room: RoomWithUsers | null; 
}

export type CreateNewRoom = Pick<Room, "name">

export interface randomAlien {
    x: number;
    y: number;
    delay:number

}
