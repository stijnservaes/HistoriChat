import { getAuth } from "@clerk/express";
import { NextFunction, Request, Response } from "express";
import { chatRooms } from "../lib/rooms";




export async function retrieveRooms(req: Request, res: Response, next: NextFunction) {
  const auth = getAuth(req)

  if (!auth.userId) {
    res.status(401).json({success: false, message: "Unauthorized access."})
    return;
  }

  res.json({success: true, message: chatRooms})
}