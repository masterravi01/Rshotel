import "./config.js";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morganMiddleware from "./logger/morgan.logger.js";
import { errorHandler } from "./middleware/error.middlewares.js";
import indexRouter from "./routes/index.routes.js";
const app = express();

const corsOptions = {
  origin:
    process.env.CORS_ORIGIN === "*"
      ? "*" // This might give CORS error for some origins due to credentials set to true
      : process.env.CORS_ORIGIN?.split(","), // For multiple cors origin for production.
  credentials: true,
};
app.use(cors(corsOptions));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: false, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(morganMiddleware);
app.use("/hotelpro", indexRouter);

app.get("/*", (req, res) => {
  res.send("Hello World!!!!");
});
// Handling preflight requests
// preflight requests sent by the browser to determine whether the actual request (e.g., a GET or POST request) is safe to send.
app.options(
  "*",
  cors({
    origin: true,

    credentials: true,
  })
);
app.set("view engine", "ejs");
app.use(errorHandler);
const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});
app.get("/zz", (req, res) => {
  res.send("Hello World!");
});
