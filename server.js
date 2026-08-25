const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Раздаем статические файлы (CSS, JS) прямо из корня
app.use(express.static(__dirname));

// Главная страница: ВСЕГДА отдаем index.html из корня
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
    console.log('Пользователь подключился:', socket.id);
    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        socket.to(roomId).emit('user-connected', socket.id);
    });
    socket.on('offer', (offer, roomId) => socket.to(roomId).emit('offer', offer));
    socket.on('answer', (answer, roomId) => socket.to(roomId).emit('answer', answer));
    socket.on('ice-candidate', (candidate, roomId) => socket.to(roomId).emit('ice-candidate', candidate));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));
