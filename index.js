import "./src/config.js";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
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

//routes import
import indexRouter from "./src/routes/index.routes.js";

//routes declaration
app.use("/api/v1", indexRouter);

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

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});
app.get("/zz", (req, res) => {
  res.send("Hello World!");
});
