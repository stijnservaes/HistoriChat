import { getAuth } from "@clerk/express";
import { NextFunction, Request, Response } from "express";
import { chatRooms } from "../lib/rooms";
import { Message } from "../models/Schema";

export async function retrieveRooms(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const auth = getAuth(req);

  if (!auth.userId) {
    return void res
      .status(401)
      .json({ success: false, message: "Unauthorized access." });
  }

  res.json({ success: true, message: chatRooms });
}

export async function retrieveChats(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const auth = getAuth(req);

  if (!auth.userId) {
    return void res
      .status(401)
      .json({ success: false, message: "Unauthorized access." });
  }

  const { roomId } = req.params;
  if (!roomId || typeof roomId !== "string") {
    return void res
      .status(400)
      .json({
        success: false,
        message: "Invalid roomId in params when retrieving chats",
      });
  }


  try {
    const messages = await Message.find({ roomId: Number(roomId) }).sort({_id: -1}).limit(20);

    return void res.json({ success: true, message: messages.reverse() });


    
  } catch (e) {
    if (e instanceof Error) {
      console.error("Chat retrieval error: ", e.message);
      return void res
        .status(400)
        .json({ success: false, message: `Chat retrieval error.` });
    } else {
      console.error("Unknown error has occurred when retrieving chats");
      return void res
        .status(400)
        .json({
          success: false,
          message: "Unknown error has occurred when retrieving chats",
        });
    }
  }
}
