require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const http = require("http");
const { Server } = require("socket.io");

const app = express();

const connectDB = require("./src/config/db");

connectDB();

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(morgan("dev"));

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://beyondthebusstop.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

app.use(express.json());

// ==========================================
// API DOCUMENTATION
// ==========================================

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to BTBS API",
    version: "1.0.0",
    documentation: {
      baseUrl: "/api",
      endpoints: {
        auth: {
          "POST /api/auth/register-commuter":
            "Register a new commuter user",
          "POST /api/auth/register-business":
            "Register a new business user",
          "POST /api/auth/login":
            "Login with email and password",
          "POST /api/auth/verify-otp":
            "Verify email OTP for registration",
          "POST /api/auth/resend-otp":
            "Resend registration OTP",
          "POST /api/auth/forgot-password":
            "Request password reset OTP",
          "POST /api/auth/reset-password":
            "Reset password with OTP",
          "POST /api/auth/verify-reset-otp":
            "Verify password reset OTP",
          "GET /api/auth/profile":
            "Get authenticated user profile",
        },

        routes: {
          "GET /api/routes": "Get all routes",
          "GET /api/routes/search":
            "Search routes by origin/destination",
          "GET /api/routes/:id":
            "Get route by ID",
          "POST /api/routes/create":
            "Create new route",
          "PUT /api/routes/:id":
            "Update route",
          "DELETE /api/routes/:id":
            "Delete route",
        },

        confirmations: {
          "GET /api/confirmations/routes/:routeId":
            "Get confirmations for a route",
          "POST /api/confirmations/:routeId":
            "Create confirmation",
          "PATCH /api/confirmations/:confirmationId":
            "Update confirmation",
          "DELETE /api/confirmations/:confirmationId":
            "Delete confirmation",
        },

        safetyPoints: {
          "GET /api/safety-points":
            "Get all safety points",
          "GET /api/safety-points/category/:category":
            "Get safety points by category",
          "POST /api/safety-points":
            "Create safety point",
        },

        locations: {
          "GET /api/locations/search":
            "Search locations",
          "GET /api/search/locations/nearby":
            "Search nearby places",
        },

        search: {
          "GET /api/search":
            "General search endpoint",
        },

        reports: {
          "POST /api/reports":
            "Create a report",
        },

        places: {
          "GET /api/places/search":
            "Search locations",
          "GET /api/places/nearby":
            "Search nearby places",
        },

        listings: {
          "POST /api/listings": "Create listing (business only)",
          "GET /api/listings": "Get all listings",
          "GET /api/listings/my": "Get current user's listings (business only)", "GET /api/listings/:id": "Get listing by ID",
        },

        uploads: {
          "POST /api/uploads": "Upload single image (business only)",
        },
      },
    },
  });
});

// ==========================================
// HTTP SERVER
// ==========================================

const server = http.createServer(app);

// ==========================================
// SOCKET.IO
// ==========================================

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://beyondthebusstop.vercel.app",
    ],
    methods: ["GET", "POST", "PATCH"],
    credentials: true,
  },
});

app.set("io", io);

// ==========================================
// PORT
// ==========================================

const PORT = process.env.PORT || 5000;

// ==========================================
// ROUTES
// ==========================================

app.use("/api/auth", require("./src/routes/auth.routes"));
app.use("/api/routes", require("./src/routes/route.routes"));
app.use(
  "/api/confirmations",
  require("./src/routes/confirmation.routes")
);
app.use(
  "/api/safety-points",
  require("./src/routes/safetyPoint.routes")
);
app.use(
  "/api/locations/search",
  require("./src/routes/search.routes")
);
app.use("/api/reports", require("./src/routes/report.routes"));
app.use("/api", require("./src/routes/search.routes"));
app.use(
  "/api/places",
  require("./src/routes/googlePlaces.routes")
);
app.use("/api/trips", require("./src/routes/trip.routes"));
app.use("/api/uploads", require("./src/routes/upload.routes"));
app.use("/api/listings", require("./src/routes/listing.routes"));
// ==========================================
// SOCKET EVENTS
// ==========================================

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

// ==========================================
// START SERVER
// ==========================================

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});