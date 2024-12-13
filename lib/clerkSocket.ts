import { ExtendedError, Socket } from "socket.io";
import jwt from "jsonwebtoken";

export async function checkAuth(
  socket: Socket,
  next: (err?: ExtendedError) => void
) {
  try {
    const token = socket.handshake.auth.token;
    const permittedOrigins = ["http://localhost:3000"];
    if (!token) {
      return void next(new Error("Authentication token is missing"));
    }

    const publicKey = process.env.CLERK_PUBLIC_KEY;
    console.log(publicKey);
    if (!publicKey) {
      throw new Error("Set CLERK_PUBLISHABLE_KEY in .env");
    }

    const decoded = jwt.verify(token, publicKey, { algorithms: ["RS256"] });
    console.log(decoded);
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
    next();
  } catch (error: any) {
    console.error("Socket authentication failed: ", error.message);
    next(new Error("Authentication failed"));
  }
}
