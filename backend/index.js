const express = require('express');
const WebSocket = require('ws');
const { startGame } = require('./game');

const app = express();
const server = app.listen(process.env.PORT || 3000, () => console.log('Server berjalan'));
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('Client terhubung');
  
  ws.on('message', (message) => {
    const data = JSON.parse(message);
    if (data.type === 'bet') {
      ws.send(JSON.stringify({ type: 'bet_accepted', amount: data.amount }));
    }
  });

  ws.on('close', () => console.log('Client terputus'));
});

function broadcastMultiplier(multiplier) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'multiplier', value: multiplier }));
    }
  });
}

startGame(broadcastMultiplier);

app.get('/', (req, res) => res.send('Backend Crash Game'));
