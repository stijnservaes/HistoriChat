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

dotenv.config();

const PORT = process.env.PORT || 3001;
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });

app.use(clerkMiddleware());
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => console.log("Connected to DB"))
  .catch((err) => console.error("Error connecting to db: ", err));

webSocketSetup(io);

app.use("/rooms", httpRoutes);
app.use("/api/webhooks", webhookRoutes);


httpServer.listen(PORT, () => {
  console.log("Listening on port ", PORT);
});
