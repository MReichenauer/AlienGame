import { CreateGameRound } from "@shared/types/Models";
import prisma from "../prisma";

export const storeReactionTime = async (data:CreateGameRound) =>{
	await prisma.gameRound.create({
		data
	})
}
