const express = require("express");
const http = require("http");
const WebSocket = require("ws");

// Create the express application
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Function to generate random forex data for multiple pairs and banks
function generateForexData() {
  const pairs = [
    "EUR/USD",
    "USD/JPY",
    "GBP/USD",
    "USD/CHF",
    "AUD/USD",
    "USD/CAD",
    "NZD/USD",
    "EUR/GBP",
    "EUR/AUD",
    "EUR/CAD",
  ];
  const banks = ["BANK1", "BANK2", "BANK3", "BANK4", "BANK5"];
  const data = [];

  for (let i = 0; i < pairs.length; i++) {
    for (let j = 0; j < banks.length; j++) {
      for (let k = 0; k < 200; k++) {
        // 2000 or more records per pair per second
        const bid = parseFloat((Math.random() * (100 - 1) + 1).toFixed(4));
        const ask = parseFloat((bid + Math.random() * 0.1).toFixed(4));
        const spread = parseFloat((ask - bid).toFixed(4));
        const midRateValue = parseFloat(((bid + ask) / 2).toFixed(4));

        data.push({
          pair: pairs[i],
          bank: banks[j],
          type: "major",
          bid: bid,
          ask: ask,
          spread: spread,
          midRateValue: midRateValue,
        });
      }
    }
  }

  return data;
}

// API endpoint to get forex data
app.get("/api/forex-data", (req, res) => {
  const forexData = {
    headers: {},
    body: {
      date: new Date().toISOString(),
      data: generateForexData(),
      count: 52,
      message: "Currency pairs with bid and ask prices",
      status: 200,
      timestamp: Date.now(),
    },
    statusCode: "OK",
    statusCodeValue: 200,
  };

  res.json(forexData);
});

// WebSocket connection handling
wss.on("connection", (ws) => {
  console.log("Client connected");

  const sendForexData = () => {
    const forexData = {
      headers: {},
      body: {
        date: new Date().toISOString(),
        data: generateForexData(),
        count: 52,
        message: "Currency pairs with bid and ask prices",
        status: 200,
        timestamp: Date.now(),
      },
      statusCode: "OK",
      statusCodeValue: 200,
    };

    ws.send(JSON.stringify(forexData));
  };

  // Send data every second
  const intervalId = setInterval(sendForexData, 1000);

  ws.on("close", () => {
    console.log("Client disconnected");
    clearInterval(intervalId);
  });
});

// Serve static files (if any)
app.use(express.static("public"));

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
