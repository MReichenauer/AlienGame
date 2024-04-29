export {}

export interface Room {
    id: string;
    name: string;
    users?: User[]
};

export interface User {
    id: string;
    username: string;
   gameRoomId:string | null;
   gameRound?:GameRound[]
   score?: number | null;
   highScore?: number | null;
}
export interface UserInRoom {
    id: string;
    username: string;
    gameRoomId: string | null;
}

export interface GameRound {
    id: string;
    reaction_time:number
    userId:string;
}
export interface HighScore{
    id: string;
    username : string;
    highscore: number;
    userId : string;
}
export interface MatchResult{
    id: string;
    player1_username:string;
    player2_username:string;
    player1_score:number;
    player2_score:number;
    createdAt? : Date
}

export type createNewHighscore = Omit<HighScore, "id">

export type CreateGameRound = Omit<GameRound, "id">

export type CreateNewMatchResult = Omit<MatchResult, "id">

export type updateNewUser = Partial<User>