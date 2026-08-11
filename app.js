const express = require("express");
const cors = require("cors");
const app = express();
const morgan = require("morgan");
require("dotenv").config();

const connectDB = require("./src/config/db");

app.use(morgan("dev"));
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Welcome to BTBS...");
});

app.use(
  cors({
    origin: ("https://behindthebusstop.vercel.app", "https://localhost:5173"),
    credentials: true,
  }),
);

app.use("/api/auth", require("./src/routes/auth.routes"));
app.use("/api/routes", require("./src/routes/route.routes"));
app.use("/api/confirmations", require("./src/routes/confirmation.routes"));
app.use("/api/safety-points", require("./src/routes/safetyPoint.routes"));

app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port ${PORT}`);
});
