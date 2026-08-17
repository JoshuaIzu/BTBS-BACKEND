require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const http = require("http");
const { Server } = require("socket.io");

const app = express();

const connectDB = require("./src/config/db");

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://behindthebusstop.vercel.app"
    ],
    methods: ["GET", "POST", "PATCH"],
    credentials: true
  },
});

// Make Socket.IO available to controllers
app.set("io", io);

const PORT = process.env.PORT || 5000;

app.use(morgan("dev"));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to BTBS...");
});

// Routes
app.use("/api/auth", require("./src/routes/auth.routes"));
app.use("/api/routes", require("./src/routes/route.routes"));
app.use("/api/confirmations", require("./src/routes/confirmation.routes"));
app.use("/api/safety-points", require("./src/routes/safetyPoint.routes"));
app.use("/api/locations/search", require("./src/routes/search.routes"));
app.use("/api/reports", require("./src/routes/report.routes"));
app.use("/api", require("./src/routes/search.routes"));
app.use("/api/trips", require("./src/routes/trip.routes"));

// Socket.IO
io.on("connection", (socket) => {
  console.log("🔌 Client connected:", socket.id);

  socket.on("joinTrip", (shareToken) => {
    socket.join(`trip:${shareToken}`);

    console.log(
      `👤 ${socket.id} joined trip ${shareToken}`
    );
  });

  socket.on("disconnect", () => {
    console.log("🔌 Client disconnected:", socket.id);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});