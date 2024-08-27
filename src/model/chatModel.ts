import mongoose, { Schema, Document } from 'mongoose';


const chatSchema = new Schema({
    senderId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required:true
    },
    roomId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Poll',
        required:true
    },
    message:{
        type:String,
        required:true,
    },
    
},{
    timestamps:true
})

export const Chat = mongoose.model('chat',chatSchema)