import { ExtendedError, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { User } from "../models/Schema";

export async function checkAuth(
  socket: Socket,
  next: (err?: ExtendedError) => void
) {
  try {
    const token = socket.handshake.auth.token;
    const permittedOrigins = ["http://localhost:3000","https://histori-chat-next-js.vercel.app"];
    if (!token) {
      return void next(new Error("Authentication token is missing"));
    }

    const publicKey = process.env.CLERK_PUBLIC_KEY;
    if (!publicKey) {
      throw new Error("Set CLERK_PUBLISHABLE_KEY in .env");
    }

    const decoded = jwt.verify(token, publicKey, { algorithms: ["RS256"] });
    if (typeof decoded === "string" || !decoded.exp || !decoded.nbf) {
      return void next(new Error("Decoded token invalid"));
    }

    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp < currentTime || decoded.nbf > currentTime) {
      return void next(new Error(`Token is expired or not yet valid`));
    }

    if (decoded.azp && !permittedOrigins.includes(decoded.azp)) {
      return void next(new Error("Invalid 'azp' claim"));
    }


    try {
      const user = await User.findOne({clerkId: decoded.sub})
      socket.user = user;
    } catch (error: any) {
      if (error instanceof Error) {
        console.error("Error: Could not find user in MongoDB: ", error.message)
        return void next( new Error("Could not find user in MongoDb"))
      } else {
        console.error("Unknown error has occurred in checkAuth when retrieving user from MongoDB")
        return void next(new Error("Unknown error has occurred in checkAuth when retrieving user from MongoDB"))
      }
    }








    next();
  } catch (error: any) {
    console.error("Socket authentication failed: ", error.message);
    next(new Error("Authentication failed"));
  }
}
