const { PeerServer } = require('peerjs');

const port = process.env.PORT || 3000;

const server = PeerServer({
    port: port,
    path: '/myapp',
    allow_discovery: true
});

server.on('connection', (client) => {
    console.log('✅ Клиент подключился:', client.id);
});

server.on('disconnect', (client) => {
    console.log('❌ Клиент отключился:', client.id);
});

console.log(`🚀 PeerJS сервер запущен на порту ${port}`);
console.log(`📍 Путь: /myapp`); 
