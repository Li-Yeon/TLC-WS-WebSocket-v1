const WebSocket = require('ws');
const http = require('http');

const server = http.createServer((req, res) => {
    // Add CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); // Allow methods
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Allow headers

    // Respond to preflight requests
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('WebSocket server is running\n');
});

const wss = new WebSocket.Server({ server });
const clients = new Map();

// Handle WebSocket connections
wss.on('connection', (ws) => {
    console.log('New client connected');

    clients.set(ws, null);

    // Handle incoming messages
    ws.on('message', (message) => {
        const { action, room, data } = JSON.parse(message);

        if (action === 'join') {
            clients.set(ws, room);
            ws.send(`Joined room: ${room}`);
            console.log('Clients:', getClientsInRooms());
        } else if (action === 'leave') {
            clients.set(ws, null);
            ws.send(`Left room: ${room}`);
        } else if (action === 'message') {
            broadcast(room, data);
        }
    });

    // Handle client disconnection
    ws.on('close', () => {
        console.log('Client disconnected');
        clients.delete(ws);
    });
});

function broadcast(room, message) {
    console.log(room);

    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN && clients.get(client) === room) {
            client.send(message);
        }
    });
}

function getClientsInRooms() {
    const result = {};
    clients.forEach((room, client) => {
        result[client._socket.remoteAddress] = room;
    });
    return result;
}

server.listen(3000, () => {
    console.log('Server is listening on PORT 443');
});
