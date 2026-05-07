const dotenv = require("dotenv");
dotenv.config();
const http = require("http");
const socketModule = require("./socket");

const express = require("express");
const db = require("./Configs/db");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const userRouter = require("./Routes/user.route");
const adminRouter = require("./Routes/admin.route");
const movementRouter = require("./Routes/movement.route");
const connectionRouter = require("./Routes/connection.route");
const chatRouter = require("./Routes/chat.route");
const communityRouter = require("./Routes/community.route");
const notificationRouter = require("./Routes/notification.route");

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
socketModule.init(server);

db();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
}));


PORT = process.env.PORT || 3001;

app.get("/", (req, res) => {
    res.status(401).json({
        message: "Access Denied!",
    })
})

app.use("/user", userRouter);
app.use("/admin", adminRouter);
app.use("/movement", movementRouter);
app.use("/connection", connectionRouter);
app.use("/chat", chatRouter);
app.use("/community", communityRouter);
app.use("/notification", notificationRouter);

server.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
})