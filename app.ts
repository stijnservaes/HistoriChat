import express from "express";
import { createServer } from "http"
import { Server } from "socket.io";
import webSocketSetup from './sockets/index'
import morgan from "morgan";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express();
const httpServer = createServer(app)
const io = new Server(httpServer,{cors: {origin: "*"}})

webSocketSetup(io)


app.use(express.json());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));



httpServer.listen(PORT, () => {
  console.log("Listening on port ", PORT);
});
