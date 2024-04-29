import { CreateNewMatchResult } from "@shared/types/Models";
import prisma from "../prisma";


export const findMatchResults = async () => {
	return await prisma.matchResult.findMany({
		orderBy:{
			createdAt:"desc"
		},take: 10
	})
}

export 	const createMatchResult = async (data:CreateNewMatchResult) => {
	return await prisma.matchResult.create({
		data
	})
}
