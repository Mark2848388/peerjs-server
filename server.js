// server.js - ПРАВИЛЬНАЯ ВЕРСИЯ
const { PeerServer } = require('peer');

const server = PeerServer({
    port: process.env.PORT || 3000,
    path: '/myapp',
    allow_discovery: true // ВАЖНО!
});

console.log(`✅ Сервер запущен на порту ${process.env.PORT || 3000}`);
