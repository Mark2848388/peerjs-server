const express = require('express');
const { PeerServer } = require('peer');

const app = express();
const PORT = process.env.PORT || 8080;

// PeerJS сервер
const peerServer = PeerServer({
    port: 9000,
    path: '/'
});

// Проверка, что сервер работает
app.get('/', (req, res) => {
    res.send('✅ PeerJS сервер работает!');
});

app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        peerjs: 'running on port 9000'
    });
});

// Запускаем
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Сервер запущен на порту ${PORT}`);
    console.log(`🔗 PeerJS: порт 9000, путь: /`);
    console.log(`🟢 Всё работает!`);
});
