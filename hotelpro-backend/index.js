import express from "express";
import cors from "cors";
import { configDotenv } from "dotenv";
import cookieParser from "cookie-parser";
import morganMiddleware from "./logger/morgan.logger.js";
import mongo from "./database/database.service.js";
import { errorHandler } from "./middleware/error.middlewares.js";
import indexRouter from "./routes/index.route.js";

configDotenv();
const app = express();
const port = process.env.APP_PORT;

// Global middlewares
app.use(
  cors({
    origin:
      process.env.CORS_ORIGIN === "*"
        ? "*" // This might give CORS error for some origins due to credentials set to true
        : process.env.CORS_ORIGIN?.split(","), // For multiple cors origin for production.
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

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

// Handling preflight requests
// preflight requests sent by the browser to determine whether the actual request (e.g., a GET or POST request) is safe to send.
app.options("*", cors());

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

// set the view engine to ejs
app.set("view engine", "ejs");

app.use(errorHandler);
