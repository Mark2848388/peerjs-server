const PeerServer = require('peer').PeerServer;

const port = process.env.PORT || 3000;

const server = PeerServer({
    port: port,
    path: '/myapp',
    allow_discovery: true
});

server.on('connection', (client) => {
    console.log('Клиент подключился:', client.id);
});

console.log('Сервер PeerJS запущен на порту ' + port);
