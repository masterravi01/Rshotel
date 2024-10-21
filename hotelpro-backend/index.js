import express from "express";
import cors from "cors";
import { configDotenv } from "dotenv";
import cookieParser from "cookie-parser";
import morganMiddleware from "./logger/morgan.logger.js";
import mongo from "./database/database.service.js";
import { errorHandler } from "./middleware/error.middlewares.js";
import indexRouter from "./routes/index.routes.js";
import http from "http";
import socket from "./controllers/notification/socket.js";
import path from "path";
import { fileURLToPath } from "url"; // Import fileURLToPath for ES modules

configDotenv();
const app = express();
const port = process.env.APP_PORT || 8080; // Default to 8080 if not set

// Create HTTP server with Express app
const server = http.createServer(app);

// Create __dirname equivalent in ES module
const __filename = fileURLToPath(import.meta.url); // Get the current module's URL
const __dirname = path.dirname(__filename); // Get the directory name

// Global middlewares
app.use(
  cors({
    origin:
      process.env.CORS_ORIGIN === "*"
        ? "*"
        : process.env.CORS_ORIGIN?.split(","),
    credentials: true,
  })
);

app.use(
  express.json({
    limit: "16kb",
  })
);
app.use(cookieParser());

app.use(morganMiddleware);

app.use("/hotelpro", indexRouter);

// Serve static files from dist directory
const distDir = path.join(__dirname, "dist", "browser"); // Use the new __dirname
app.use(express.static(distDir));
app.get("/*", (req, res) => {
  res.sendFile(path.resolve(distDir, "index.html"));
});

// Handling preflight requests
app.options("*", cors());

// Set the view engine to ejs
app.set("view engine", "ejs");

// Error handler middleware
app.use(errorHandler);

// Start the server and listen on the specified port
server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
