// socketHandler.js
import { Server } from 'socket.io';

let io; // Socket.IO instance

export const initializeSocketIO = (server) => {
    io = new Server(server, {
        cors: {
            origin: '*:*',
        }
    });

    io.on('connection', (socket) => {
        console.log('A user connected');

        // You can handle common events here if needed

        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
    });
}
export const emitEvent = (eventName, data) => {
    if (io) {
        io.emit(eventName, data);
    } else {
        console.error('Socket.IO not initialized');
    }
}