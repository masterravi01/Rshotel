import express from "express";

import { configDotenv } from "dotenv";
configDotenv();
const app = express();
const port = process.env.APP_PORT || 3000;

app.get("/", (req, res) => {
  res.send("Hello World! This is a simple Node.js app");
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
