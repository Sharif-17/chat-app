const WebSocket = require("ws");

// PORT für Render oder lokal
const PORT = process.env.PORT || 6001;

// WebSocket-Server starten (auf 0.0.0.0 für Render)
const server = new WebSocket.Server({ port: PORT, host: '0.0.0.0' });
console.log(`WebSocket server is running on ws://0.0.0.0:${PORT}`);

// Verbundene Clients speichern
let clients = [];

server.on("connection", (ws) => {
    let userName = "";

    ws.on("message", (message) => {
        message = String(message);

        if (!userName) {
            userName = message;
            clients.push({ ws, userName });

            ws.send(JSON.stringify({ message: `You are now known as ${userName}.`, type: "system" }));
            broadcast(`[SYSTEM] ${userName} has joined the chat.`, "system", ws);
        } else {
            broadcast(`${userName}: ${message}`, "user", ws);
        }
    });

    ws.on("close", () => {
        console.log(`${userName} disconnected.`);
        clients = clients.filter(client => client.ws !== ws);
        broadcast(`[SYSTEM] ${userName} has disconnected.`, "system", ws);
    });

    ws.on("error", (error) => {
        console.log(`WebSocket error: ${error.message}`);
    });

    function broadcast(message, type = "user", senderWs) {
        const payload = JSON.stringify({ message, type });
        clients.forEach(client => {
            if (client.ws !== senderWs && client.ws.readyState === WebSocket.OPEN) {
                client.ws.send(payload);
            }
        });
    }
});
