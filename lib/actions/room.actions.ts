'use server';
import {nanoid} from 'nanoid'
import { liveblocks } from '../liveblocks'
import { revalidatePath } from 'next/cache'
import { parseStringify } from '../utils'
export const createDocument = async ({userId, email}: CreateDocumentParams) =>{
    const roomId = nanoid()
    try{
        const metadata = {
            creatorId: userId,
            email,
            title: 'Untitled'
        }
        const usersAccesses: RoomAccesses = {
            [email]:['room:write']
        }
        const room = await liveblocks.createRoom(roomId, {
            metadata,
            usersAccesses,
            defaultAccesses: []
          });
          
          revalidatePath('/')
          return parseStringify(room)

    }catch(error){
        console.log(`Error happened while creating a room: ${error}`)
        // throw new Error(`Error happened while creating a room: ${error.message}`);
    }
}

export const getDocument = async ({roomId, userId}:{roomId: string; userId:string}) =>{
    try{
        const room = await liveblocks.getRoom(roomId)
        // TODO: uncomment this later
        // const hasAccess = Object.keys(room.usersAccesses).includes(userId);
        // if(!hasAccess){
        //     throw new Error("zyou do not have access to this document.")
        // }
        return parseStringify(room)
    }catch(error){
        console.log(`Error happened while getting a room: ${error}`)
    }
    
}