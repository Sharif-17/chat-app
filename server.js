const { type } = require("os");
const Websocket = require("ws");

// Local Testing
const port =  6001;
const serverUrl = "ws://127.0.0.1:6001";

// Create WebSocket server
const server = new Websocket.Server({host : "127.0.0.1", port});
console.log(`WebSocket server is running on ${serverUrl}`);

// Array to score connected clients
let clients = [];

server.on("conection", (ws) =>{
    let userName = "";  // initialize userName as an empty string

    // Handle nickname submission or message reception
    ws.on("message", (message) =>{
        message = String(message); // ensure message is treated as a string

        if (!userName){
            
            userName = message;
            clients.push({ws, userName});

            ws.send(JSON.stringify({ message: `You are know as ${userName}. `, type: "system"}));
        
            // Notify all clients that the user has joined (system message)

            broadcast(`'[SYSTEM] ${userName} has joinedd the chat.`, "system", ws);

        }else{
             // Forward chat message to all clients (user message)
             broadcast(`${username}: ${message}`, "user", ws);
         
        }
    });

    // Handle disconnections
    ws.on("close", () =>{
        console.log(`${userName} disconnected.`);
        clients = clients.filter((client) => client.ws !== ws);
        broadcast(`[SYSTEM] ${userName} has disconnected. `, "system", ws);

    });

    //Handle errors
    ws.on("error", (error) =>{
        console.log(`WebSocket error: ${error.message}`);
    });

    // Broadcast a message to all clients except the sender
    function broadcast(message, type = "user", senderWs){
        const payload = JSON.stringify({message, type})
        clients.forEach((client) =>{
            if(client.ws !== senderWs && client.ws.readyState === WebSocket.OPEN){
                client.ws.send(payload); // Send the valid JSON message
            }
        });
    }
});

// NOW TEST THE SERVER LOCALLY