import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { Poll } from '../model/pollModel';
import { User } from '../model/userModel';
import { ChatRepository } from './chatRepository';

const chatRepository = new ChatRepository();
const onlineUsers = new Map();
let io: Server


export const setupSocket = (server: HttpServer) => {
    io = new Server(server, {
        cors: {
            origin: '*',
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log('A User Connected');

        socket.on('user-connect', (userId) => {
            console.log(userId, 'userconnected');

            onlineUsers.set(userId, { socketId: socket.id, lastActive: Date.now() });
            broadcastOnlineUsers();
        });

        socket.on('joinRoom',async (id) => {
            console.log(id, 'room joined');
            const room = id;
            socket.join(room);

            const messages = await chatRepository.getMessages(id);
            socket.emit('allMessages',messages)
        });

        socket.on('sendMessage', async({senderId,roomId,message})=>{
            const room = roomId;
            const savedMessage = await chatRepository.sendMessage(senderId,roomId,message);
            const updatedMessage = await chatRepository.getMessageById(savedMessage._id as unknown as string)

            io.to(room).emit('message',updatedMessage)

        })

        socket.on('vote', async ({ pollId, optionText, userId }) => {
            try {
                // Find the poll and update the votes
                const poll = await Poll.findById(pollId);
                if(poll){
                const option = poll.options.find(opt => opt.optionText === optionText);
                if (option) {
                    option.votes += 1;
                    await poll.save();

                    // Emit the updated poll to all clients in the room
                    io.to(pollId).emit('poll-updated', poll);

                }
            }
            } catch (error) {
                console.error('Error updating poll:', error);
            }
        });



        socket.on('disconnect', () => {
            console.log('A User Disconnected');
            for (let [userId, userData] of onlineUsers.entries()) {
                if (userData.socketId === socket.id) {
                    onlineUsers.delete(userId);
                    console.log(userId, 'user-disconnected');

                    break;
                }
            }
            broadcastOnlineUsers();
        });
    })

    function broadcastOnlineUsers() {
        const onlineUserIds = Array.from(onlineUsers.keys());
        io.emit('online-users', onlineUserIds);
    }

    setInterval(() => {
        const now = Date.now();
        for (const [userId, userData] of onlineUsers.entries()) {
            if (now - userData.lastActive > 60000) {
                onlineUsers.delete(userId);
            }
        }
        broadcastOnlineUsers();
    }, 30000);

}

export { io };