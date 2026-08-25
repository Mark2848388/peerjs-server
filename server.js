const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Раздаем статические файлы (HTML, CSS, JS) где бы они ни лежали
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, 'public')));

// Главная страница (если файл лежит в public, берем его оттуда)
app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, 'public', 'index.html');
    res.sendFile(indexPath, (err) => {
        if (err) {
            // Если в public нет, пробуем найти в корне
            res.sendFile(path.join(__dirname, 'index.html'));
        }
    });
});

// Сигнальный сервер для WebRTC
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
