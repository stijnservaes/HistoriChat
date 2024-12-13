import { User } from "../models/Schema";

declare module "socket.io" {
  interface Socket {
    user?: User; 
  }
}