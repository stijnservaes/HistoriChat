import { NextFunction, Request, Response } from "express";


export const chatRooms = [
  {
    name: "Victorian Era",
    id: 1
  },
  {
    name: "Shakespearian Era",
    id: 2
  },
  {
    name: "Roman Era",
    id: 3
  }
]


export async function retrieveRooms(req: Request, res: Response, next: NextFunction) {
  console.log("should see")
  res.json(chatRooms)
}