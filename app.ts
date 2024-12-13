import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import webSocketSetup from "./sockets/index";
import morgan from "morgan";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { clerkMiddleware } from "@clerk/express";
import httpRoutes from "./routes/httpRoutes";
import webhookRoutes from "./routes/webhook";
import { checkAuth } from "./lib/clerkSocket";
import cron from 'node-cron'
import { User } from "./models/Schema";

dotenv.config();

const PORT = process.env.PORT || 3001;
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: ["http://localhost:3000", "https://histori-chat-next-js.vercel.app/"] }, transports: ["websocket"] });

app.get("/ping", (req, res) => void res.json({success: true, message: "Pinged"}))

app.use(clerkMiddleware());
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => console.log("Connected to DB"))
  .catch((err) => console.error("Error connecting to db: ", err));


io.use(checkAuth)
webSocketSetup(io);

app.use("/rooms", httpRoutes);
app.use("/api/webhooks", webhookRoutes);


httpServer.listen(PORT, () => {
  console.log("Listening on port ", PORT);
});

cron.schedule("0 0 * * *", async () => {
  try {
    console.log("Running daily reset task...")
    const result = await User.updateMany({}, {dailyInvocations: 0})
    console.log(`Reset ${result.modifiedCount} users`)
  } catch (err) {
    console.error("Error when executing daily reset task", err)
  }
})