import { Server, Socket } from "socket.io";
import { roomExists } from "../lib/rooms";

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

    if (socket.rooms.has(roomId.toString()) && exists) {
      return io
        .to(roomId.toString())
        .emit("chat", { success: true, message: message });
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
