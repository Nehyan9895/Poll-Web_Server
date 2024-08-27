import { Chat } from "../model/chatModel";
import { Poll } from "../model/pollModel";
import { User } from "../model/userModel";

export class ChatRepository{
    async sendMessage(senderId:string,roomId:string,message:string){
        const newMessage = new Chat({senderId,roomId,message});
        return await newMessage.save();
    }
    
    async getMessageById(id:string){
        const message = await Chat.findById(id).populate('senderId');

        return message
    }

    async getMessages(roomId:string){
        const messages = await Chat.find({roomId:roomId}).sort({timestamp:1}).populate('senderId')
        return messages
    }
}