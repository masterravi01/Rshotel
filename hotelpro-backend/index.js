const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const morganMiddleware = require("./logger/morgan.logger")

const port = process.env.APP_PORT;
const schema = require("./database/database.schema");
const mongo = require("./database/database.service");
const { errorHandler } = require("./middleware/error.middlewares")

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

app.use(express.json({
    limit: "16kb"
}));
app.use(cookieParser());

app.use(morganMiddleware);

const indexRouter = require("./routes/index.route");
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

app.use(errorHandler);
