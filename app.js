require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const morgan = require("morgan");


const connectDB = require("./src/config/db");
const { searchRoutes } = require("./src/controllers/route.controller");

app.use(morgan("dev"));
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Welcome to BTBS...");
});

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://behindthebusstop.vercel.app"
    ],
    credentials: true
  })
);

app.use("/api/auth", require("./src/routes/auth.routes"));
app.use("/api/routes", require("./src/routes/route.routes"));
app.use("/api/confirmations", require("./src/routes/confirmation.routes"));
app.use("/api/safety-points", require("./src/routes/safetyPoint.routes"));
app.use("/api/locations/search", require("./src/routes/search.routes"))

app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port ${PORT}`);
});
