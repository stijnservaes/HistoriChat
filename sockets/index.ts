import { Server, Socket } from "socket.io";
import {chatMessage} from "../controllers/openaiController"

export default (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log("User connected: ", socket.id);

    chatMessage(io, socket)

    socket.on("disconnect", () => {
      console.log("User disconnected", socket.id);
    });
  });
};
