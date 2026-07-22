const { PeerServer } = require('peer');
const server = PeerServer({
    port: process.env.PORT || 3000,
    path: '/myapp'
});
console.log('Сервер запущен');
