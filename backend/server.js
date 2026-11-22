
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const session = require("express-session");

const MySQLStore = require("express-mysql-session")(session);
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
];

// CORS Configuration
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session Configuration
const sessionStore = new MySQLStore(
  {
    createDatabaseTable: true,
  schema: {
    tableName: "sessions",
    columnNames: {
      session_id: "session_id",
      expires: "expires",
      data: "data",
    },
  },
},
db
);

app.use(
  session({
    key: "campustask_session",
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 2,
    },
  })
);

// Uploads
app.use("/uploads", express.static("uploads"));

// Home Route
app.get("/", (req, res) => {
  res.status(200).send("CampusTask Node.js Backend is Running!");
});

// Database Test
app.get("/test-db", (req, res) => {
  db.query("SHOW TABLES", (err, results) => {
    if (err) {
      console.error("Database test error:", err.message);

      return res.status(500).json({
        success: false,
        message: "Database connection failed",
        error: err.message,
      });
    }

    res.status(200).json({
      success: true,
      message: "Database connected successfully",
      tables: results,
    });
  });
});

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/student", require("./routes/studentRoutes"));
app.use("/api/faculty", require("./routes/facultyRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/principal", require("./routes/principalRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

// Error Handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err.message);

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Error Monitoring
process.on("uncaughtException", (err) => {
  console.error("CRASH REASON:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("PROMISE ERROR:", err);
});

// Email Reminder Scheduler
require("./emailReminder");
