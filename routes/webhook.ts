import { NextFunction, Request, Response, Router } from "express";
import { Webhook } from "svix";
import { User } from "../models/Schema";

const router = Router();

type Evt = {
  type: string;
  object: string;
  timestamp: number;
  data: {
    username: string;
    id: string;
  };
};

router.all("/", async (req: Request, res: Response, next: NextFunction) => {
  if (!process.env.SIGNING_SECRET) {
    throw new Error("Set SIGNING_SECRET in .env");
  }

  const wh = new Webhook(process.env.SIGNING_SECRET);

  const svix_signature = req.headers["svix-signature"];
  const svix_id = req.headers["svix-id"];
  const svix_timestamp = req.headers["svix-timestamp"];

  if (!svix_id || !svix_signature || !svix_timestamp) {
    res.status(400).json({
      success: false,
      message: "Error: Missing svix headers",
    });
    return;
  }

  let evt: Evt;

  try {
    evt = wh.verify(JSON.stringify(req.body), {
      "svix-id": svix_id as string,
      "svix-signature": svix_signature as string,
      "svix-timestamp": svix_timestamp as string,
    }) as Evt;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error: Could not verify webhook:", error.message);
      return void res.status(400).json({
        success: false,
        message: error.message,
      });
    } else {
      console.error("Unknown error has occurred when verifying webhook.");
      return void res.status(400).json({
        success: false,
        message: "Unknown error has occurred when verifying webhook.",
      });
    }
  }

  try {
    await User.create({
      clerkId: evt.data.id,
      username: evt.data.username,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return void res.json({
        success: true,
        message: "Username already exists. Database not modified",
      });
    } else if (error instanceof Error) {
      console.error(
        "Error: Could not add created Clerk user to MongoDB: ",
        error.message
      );
      return void res.status(400).json({
        success: false,
        message: error.message,
      });
    } else {
      console.error(
        "Unknown error has occurred when adding Clerk user to MongoDB"
      );
      return void res.status(400).json({
        success: false,
        message: "Unknown error has occurred when adding Clerk user to MongoDB",
      });
    }
  }

  res.json({
    success: true,
    message: "Created user added to MongoDB",
  });
});

export default router;
