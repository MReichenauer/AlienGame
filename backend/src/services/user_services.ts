import { User, updateNewUser } from "@shared/types/Models";
import prisma from "../prisma";
import { Socket } from "socket.io";

// Create a new user in the database
export const createUser = async (data:User) => {

return await prisma.user.create({
			data,
		});
};

export const updateUserRoom = async (userId: string, roomId: string) => {
	return await prisma.user.update({
		where: {
			id: userId
		}, data: {
			gameRoomId: roomId
		}
	})
}

export const deleteRoom = async (roomId: string) => {
	await prisma.gameRoom.delete({
		where: {
			id: roomId
		}
	});
};

export const userGameRoom = async (userId: string) => {
	return await prisma.user.findUnique({
		where: {
			id: userId
		}, include: {
			gameRoom: true
		}
	})
}

export const updateUser = async (userId:string, data:updateNewUser) => {
	return await prisma.user.update({
		where:{
			id:userId
		},
		data: data
	})
}
