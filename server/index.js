const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const sessions = {}; // Store session data

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // PC: Create a new session
    socket.on('create-session', () => {
        const sessionId = Math.random().toString(36).substring(2, 8);
        sessions[sessionId] = {
            pcSocketId: socket.id,
            controllers: [],
            lastActive: Date.now(),
            mode: 'solo'
        };
        socket.join(sessionId);
        const publicUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
        socket.emit('session-created', { sessionId, publicUrl });
        console.log(`Session created: ${sessionId}`);
    });

    // Mobile: Join a session as a controller
    socket.on('join-controller', (sessionId) => {
        if (sessions[sessionId]) {
            sessions[sessionId].controllers.push({ mobileSocketId: socket.id, deviceType: 'gyro' });
            socket.join(sessionId);
            io.to(sessions[sessionId].pcSocketId).emit('controller-joined', socket.id);
            socket.emit('session-accepted', sessionId);
            console.log(`Controller ${socket.id} joined session ${sessionId}`);
        } else {
            socket.emit('session-error', 'Invalid session ID');
        }
    });

    // Mobile: Send sensor data
    socket.on('sensor-data', (data) => {
        if (sessions[data.sessionId]) {
            io.to(sessions[data.sessionId].pcSocketId).emit('sensor-update', data);
        }
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
        // Find which session the disconnected socket belongs to
        for (const sessionId in sessions) {
            const session = sessions[sessionId];
            if (session.pcSocketId === socket.id) {
                // PC disconnected, terminate session
                delete sessions[sessionId];
                console.log(`Session ${sessionId} terminated.`);
                break;
            }
            const controllerIndex = session.controllers.findIndex(c => c.mobileSocketId === socket.id);
            if (controllerIndex > -1) {
                // Controller disconnected
                session.controllers.splice(controllerIndex, 1);
                io.to(session.pcSocketId).emit('controller-left', socket.id);
                console.log(`Controller ${socket.id} left session ${sessionId}`);
                break;
            }
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
