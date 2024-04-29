import { createNewHighscore } from "@shared/types/Models";
import prisma from "../prisma";

 export const createHighscore = async (data:createNewHighscore) => {
	return await prisma.highScore.create({
		data
	})
}
export const fastestHighscore = async () => {
	return await prisma.highScore.findFirst({
		orderBy:{
			highscore:"asc"
		}, take: 1
	})
}
