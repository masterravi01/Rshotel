import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { configDotenv } from "dotenv";
configDotenv();
const app = express();
const port = process.env.APP_PORT || 8000;

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
app.use(cookieParser());
app.options(
  "*",
  cors({
    origin: true,

    credentials: true,
  })
);
app.get("/", (req, res) => {
  res.send("Hello World! This is a simple Node.js app");
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
