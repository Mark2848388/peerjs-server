const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { PeerServer } = require('peer');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Комнаты: { roomCode: [socketId1, socketId2, ...] }
const rooms = {};

io.on('connection', (socket) => {
  console.log('Подключен:', socket.id);

  // Пользователь заходит в комнату
  socket.on('join-room', (roomCode, callback) => {
    socket.join(roomCode);
    
    if (!rooms[roomCode]) rooms[roomCode] = [];
    
    // Отправляем новому пользователю список уже присутствующих
    const existingUsers = rooms[roomCode].filter(id => id !== socket.id);
    callback({ success: true, users: existingUsers });
    
    // Сообщаем остальным о новом участнике
    socket.to(roomCode).emit('user-joined', socket.id);
    
    rooms[roomCode].push(socket.id);
    console.log(`${socket.id} вошел в комнату ${roomCode}. Участников: ${rooms[roomCode].length}`);
  });

  // Сигнализация: предложение
  socket.on('offer', (data) => {
    socket.to(data.target).emit('offer', {
      sdp: data.sdp,
      sender: socket.id
    });
  });

  // Сигнализация: ответ
  socket.on('answer', (data) => {
    socket.to(data.target).emit('answer', {
      sdp: data.sdp,
      sender: socket.id
    });
  });

  // Сигнализация: ICE-кандидат
  socket.on('ice-candidate', (data) => {
    socket.to(data.target).emit('ice-candidate', {
      candidate: data.candidate,
      sender: socket.id
    });
  });

  // Отключение
  socket.on('disconnect', () => {
    console.log('Отключился:', socket.id);
    for (const roomCode in rooms) {
      rooms[roomCode] = rooms[roomCode].filter(id => id !== socket.id);
      if (rooms[roomCode].length === 0) {
        delete rooms[roomCode];
      } else {
        socket.to(roomCode).emit('user-left', socket.id);
      }
    }
  });
});

// PeerJS сервер (для обратной совместимости с версией для двоих)
const peerServer = PeerServer({ port: 3000, path: '/myapp' });
peerServer.on('connection', (client) => {
  console.log('PeerJS клиент:', client.id);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
