const { PeerServer } = require('peer');
const peerServer = PeerServer({ port: 3000, path: '/myapp' });
peerServer.on('connection', (client) => {
  console.log('Клиент подключился:', client.id);
});
console.log('PeerJS сервер запущен на порту 3000');
