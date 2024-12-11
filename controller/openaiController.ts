import { Server, Socket } from "socket.io";
import { generateAI } from "../services/openai";

export async function chatMessage(io: Server, socket: Socket) {
  socket.on("chat", async (msg) => {
    const response = await generateAI(msg);
    console.log(response)

    io.emit("chat", response );
  });
}
