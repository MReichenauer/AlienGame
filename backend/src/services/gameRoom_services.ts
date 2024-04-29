import { CreateNewRoom } from "@shared/types/SocketTypes";
import prisma from "../prisma";


export const createNewRoom = async (newRoom: CreateNewRoom) => {
	return await prisma.gameRoom.create({
		data: {
			name: newRoom.name
		}
	})
}

export const findRoomWithOneUserOnly = async () => {
	const oneUserOnly = await prisma.gameRoom.findMany({
		include: {
			users: true
		}
	})
	return oneUserOnly.find(room => room.users.length === 1)
}

export const findOneRoomWithUsers = async (roomId:string) => {
	return await prisma.gameRoom.findUnique({
		where: {
			id: roomId
		},
		include: {
			users: true
		}
	})
}

export const findRoomWithUsers = async (roomId:string) => {
	const room = await prisma.gameRoom.findUnique({
		where:{
			id:roomId
		},include:{
			users:{
				include:{
					gemeRound:true
				}
			}
		}

	})
	return room?.users
}



export const deleteAllRooms = async () => {
	return await prisma.gameRoom.deleteMany()
}
