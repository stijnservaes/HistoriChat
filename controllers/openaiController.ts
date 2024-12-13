import { Server, Socket } from "socket.io";
import { roomExists } from "../lib/rooms";
import { Message, User } from "../models/Schema";
import { generateAI } from "../services/openai";

export async function chatMessage(io: Server, socket: Socket) {
  socket.on("chat", async ({ roomId, message }) => {
    const exists = roomExists(roomId);

    if (!roomId || typeof roomId !== "number") {
      return socket.emit("error", {
        success: false,
        message: "No roomId in request.",
      });
    }
    if (!message) {
      return socket.emit("error", {
        success: false,
        message: "No message in request.",
      });
    }

    const user = await User.findOne({username: socket.user.username})

    if (!user) {
      return socket.emit("error", { success: false, message: "No user found in MongoDB"})
    }

    if (user.dailyInvocations > user.maxAllowedInvocations) {
      return socket.emit("no_tokens", "User has exceeded their allowed tokens per day.")
    }

    const generatedMessage = await generateAI(message, roomId)

    const newMessage = await Message.create({
      message: generatedMessage,
      byUser: socket.user.username,
      roomId: roomId,
    });

   
    await User.updateOne({username: socket.user.username}, {$inc: {dailyInvocations: 1}})

    if (socket.rooms.has(roomId.toString()) && exists) {
      return io
        .to(roomId.toString())
        .emit("chat", {
          success: true,
          message: newMessage,
        });
    } else {
      return socket.emit("error", {
        success: false,
        message: "User does not have access to room.",
      });
    }
  });

  socket.on("joinroom", async (roomId) => {
    if (!roomId || typeof roomId !== "number") {
      return socket.emit("error", {
        success: false,
        message: "Payload is not of type number.",
      });
    }

    if (roomExists(roomId)) {
      socket.join(roomId.toString());
      return socket.emit("joinroom", {
        success: true,
        message: `User has joined room ${roomId}.`,
      });
    } else {
      return socket.emit("error", {
        success: false,
        message: "RoomID does not exist.",
      });
    }
  });
}
