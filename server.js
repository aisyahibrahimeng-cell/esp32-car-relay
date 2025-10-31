// server.js
const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require("path");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let latestFrame = null;

// Serve a simple viewer HTML
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// WebSocket connection handler
wss.on("connection", (ws, req) => {
  console.log("✅ New WebSocket client connected");

  ws.on("message", (msg) => {
    // Check if it's binary (frame) or control
    if (Buffer.isBuffer(msg)) {
      latestFrame = msg;
      // Broadcast to all viewers
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(latestFrame);
        }
      });
    } else {
      console.log("Control message:", msg.toString());
    }
  });

  ws.on("close", () => console.log("❌ Client disconnected"));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 WS Relay running on port ${PORT}`));
