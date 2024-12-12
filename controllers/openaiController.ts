import { Server, Socket } from "socket.io";
import { generateAI } from "../services/openai";
import {Message} from "../models/Schema"




export async function chatMessage(io: Server, socket: Socket) {
  socket.on("chat", async ({room, message}) => {
    if (socket.rooms.has(room)) {
      io.to(room).emit("chat", message);
    }
  });

  socket.on("joinroom", async (room) => {
    socket.join(room)
  })
}
