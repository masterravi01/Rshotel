import express from "express";
import cors from "cors";
import { configDotenv } from "dotenv";
import cookieParser from "cookie-parser";
import morganMiddleware from "./logger/morgan.logger.js";
import mongo from "./database/database.service.js";
import { errorHandler } from "./middleware/error.middlewares.js";
import indexRouter from "./routes/index.routes.js";
import http from "http"; // Import http to create the server
import socket from "./controllers/notification/socket.js";
import path from "path"; // Import path for resolving paths

configDotenv();
const app = express();
const port = process.env.APP_PORT;

// Create HTTP server with Express app
const server = http.createServer(app);
//socket.initializeSocketConnection(server); // Uncommented to initialize WebSocket

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
let distDir = "./dist/browser";
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
