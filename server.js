const path = require("path");
const express = require("express");
const WebSocket = require("ws");
const http = require("http");

const app = express();
const PORT = process.env.PORT || 10000; // wichtig für Render!

// HTML & JS statisch bereitstellen
app.use(express.static(path.join(__dirname, "client")));

// Erstelle HTTP-Server (für WebSocket und Express gemeinsam)
const server = http.createServer(app);

// WebSocket-Server auf HTTP-Server binden
const wss = new WebSocket.Server({ server });

console.log(`Server läuft auf Port ${PORT}`);

// Alle verbundenen Clients
let clients = [];

wss.on("connection", (ws) => {
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
    clients = clients.filter((client) => client.ws !== ws);
    broadcast(`[SYSTEM] ${userName} has disconnected.`, "system", ws);
  });

  ws.on("error", (error) => {
    console.error(`WebSocket error: ${error.message}`);
  });

  function broadcast(message, type = "user", senderWs) {
    const payload = JSON.stringify({ message, type });
    clients.forEach((client) => {
      if (client.ws !== senderWs && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(payload);
      }
    });
  }
});

// Starte den Server
server.listen(PORT, () => {
  console.log(`HTTP/WebSocket server läuft auf Port ${PORT}`);
});
