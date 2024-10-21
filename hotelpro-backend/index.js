import express from "express";
import cors from "cors";
import { configDotenv } from "dotenv";
import cookieParser from "cookie-parser";
import http from "http"; // Import http to create the server

configDotenv();
const app = express();
const port = process.env.APP_PORT;

// Create HTTP server with Express app
const server = http.createServer(app);
// socket.initializeSocketConnection(server);

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

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

// Handling preflight requests
app.options("*", cors());

// Set the view engine to ejs
app.set("view engine", "ejs");

// Start the server and listen on the specified port
server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
