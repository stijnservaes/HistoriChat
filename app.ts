import express from "express";
import { createServer } from "http"
import { Server } from "socket.io";
import webSocketSetup from './sockets/index'
import morgan from "morgan";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { retrieveRooms } from "./controllers/httpController";
import { clerkMiddleware } from "@clerk/express";

dotenv.config();

const PORT = process.env.PORT || 3001;
const app = express();
const httpServer = createServer(app)
const io = new Server(httpServer,{cors: {origin: "*"}})

app.use(clerkMiddleware())

mongoose.connect(process.env.MONGO_URI as string).then(() => console.log("Connected to DB")).catch(err => console.error('Error connecting to db: ', err))

webSocketSetup(io)

app.get("/rooms", retrieveRooms)

app.use(express.json());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));



httpServer.listen(PORT, () => {
  console.log("Listening on port ", PORT);
});
