import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";

const port = process.env.APP_PORT ||8000 ;

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


app.set("view engine", "ejs");
app.set("views", path.join(path.resolve(), "views"));

app.get("/", (req, res) => {
  res.render('home');
});
app.get("/zz", (req, res) => {
  res.send("Hello World!");
});
app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});