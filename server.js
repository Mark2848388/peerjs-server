const { PeerServer } = require('peer');

// СОЗДАЁМ ПИР-СЕРВЕР
const peerServer = PeerServer({
    port: 9000,
    path: '/myapp',
    allow_discovery: true
});

// ПРОВЕРКА, ЧТО СЕРВЕР ЗАПУСТИЛСЯ
peerServer.on('connection', (client) => {
    console.log('👤 Клиент подключился:', client.getId());
});

peerServer.on('disconnect', (client) => {
    console.log('👤 Клиент отключился:', client.getId());
});

console.log('🚀 PeerJS сервер запущен!');
console.log('📡 Порт: 9000');
console.log('🔗 Путь: /myapp');
console.log('✅ Сервер готов к работе!');
