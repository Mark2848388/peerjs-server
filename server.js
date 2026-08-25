const express = require('express');
const http = require('http');
const path = require('path');
const { WebSocketServer } = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

wss.on('connection', (ws) => {
    console.log('Пользователь подключился!');

    // Когда пользователь вводит код комнаты и подключается
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            
            // Создание комнаты
            if (data.type === 'create_room') {
                ws.roomId = data.roomId;
                ws.send(JSON.stringify({ type: 'room_created', roomId: data.roomId }));
                ws.isCreator = true; // Помечаем создателя
            }
            
            // Подключение по код комнаты
            if (data.type === 'join_room') {
                ws.roomId = data.roomId;
                // Если второй человек зашёл, отправляем сигнал создателю
                wss.clients.forEach(client => {
                    if (client !== ws && client.roomId === data.roomId) {
                        client.send(JSON.stringify({ type: 'peer_joined' }));
                    }
                });
            }
            
            // Обработка предложения (Offer)
            if (data.type === 'offer') {
                wss.clients.forEach(client => {
                    if (client !== ws && client.roomId === data.roomId) {
                        client.send(JSON.stringify({ type: 'offer', sdp: data.sdp, roomId: data.roomId }));
                    }
                });
            }
            
            // Обработка ответа (Answer)
            if (data.type === 'answer') {
                wss.clients.forEach(client => {
                    if (client !== ws && client.roomId === data.roomId) {
                        client.send(JSON.stringify({ type: 'answer', sdp: data.sdp, roomId: data.roomId }));
                    }
                });
            }
            
            // Обработка ICE кандидатов
            if (data.type === 'ice_candidate') {
                wss.clients.forEach(client => {
                    if (client !== ws && client.roomId === data.roomId) {
                        client.send(JSON.stringify({ type: 'ice_candidate', candidate: data.candidate, roomId: data.roomId }));
                    }
                });
            }
        } catch (e) {
            console.error('Ошибка обработки:', e);
        }
    });

    ws.on('close', () => {
        if (ws.roomId) {
            wss.clients.forEach(client => {
                if (client.roomId === ws.roomId) {
                    client.send(JSON.stringify({ type: 'peer_left' }));
                }
            });
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));
