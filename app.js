require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const http = require("http");
const { Server } = require("socket.io");

const app = express();

const connectDB = require("./src/config/db");


app.use(morgan("dev"));
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// ==========================================
// API DOCUMENTATION
// ==========================================

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to BTBS API",
    version: "1.0.0",
    documentation: {
      baseUrl: `/api`,
      endpoints: {
        auth: {
          "POST /api/auth/register-commuter": "Register a new commuter user",
          "POST /api/auth/register-business": "Register a new business user",
          "POST /api/auth/login": "Login with email and password",
          "POST /api/auth/verify-otp": "Verify email OTP for registration",
          "POST /api/auth/resend-otp": "Resend registration OTP",
          "POST /api/auth/forgot-password": "Request password reset OTP",
          "POST /api/auth/reset-password": "Reset password with OTP",
          "POST /api/auth/verify-reset-otp": "Verify password reset OTP",
          "GET /api/auth/profile": "Get authenticated user profile (protected)"
        },
        routes: {
          "GET /api/routes": "Get all routes",
          "GET /api/routes/search": "Search routes by origin/destination",
          "GET /api/routes/:id": "Get route by ID",
          "POST /api/routes/create": "Create new route (business/admin)",
          "PUT /api/routes/:id": "Update route (business/admin)",
          "DELETE /api/routes/:id": "Delete route (admin)"
        },
        confirmations: {
          "GET /api/confirmations/routes/:routeId": "Get confirmations for a route",
          "POST /api/confirmations/:routeId": "Create confirmation for a route (protected)",
          "PATCH /api/confirmations/:confirmationId": "Update confirmation (protected)",
          "DELETE /api/confirmations/:confirmationId": "Delete confirmation (admin)"
        },
        safetyPoints: {
          "GET /api/safety-points": "Get all safety points",
          "GET /api/safety-points/category/:category": "Get safety points by category",
          "POST /api/safety-points": "Create safety point (admin)"
        },
        locations: {
          "GET /api/locations/search": "Search locations by text query (e.g., ?q=Ikeja)",
          "GET /api/search/locations/nearby": "Search nearby places (e.g., ?lat=6.6018&lng=3.3515&type=hospital&radius=3000)"
        },
        search: {
          "GET /api/search": "General search endpoint"
        },
        reports: {
          "POST /api/reports": "Create a report"
        },
        places: {
          "GET /api/places/search": "Search locations by text query (e.g., ?query=Ikeja)",
          "GET /api/places/nearby": "Search nearby places (e.g., ?latitude=6.6018&longitude=3.3515&type=hospital&radius=3000)"
        }
        }
      },
      authentication: {
        type: "Bearer Token",
        header: "Authorization: Bearer <token>",
        protectedEndpoints: "Most endpoints require valid JWT token"
      }
  });
});

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