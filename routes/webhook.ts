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

router.all(
  "/create",
  async (req: Request, res: Response, next: NextFunction) => {
    if (!process.env.SIGNING_SECRET_CREATE) {
      throw new Error("Set SIGNING_SECRET in .env");
    }

    const evt = setupWebhook(req, res, process.env.SIGNING_SECRET_CREATE);

    if (typeof evt === "string") {
      return void res.status(400).json({ success: false, message: evt });
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
          message:
            "Unknown error has occurred when adding Clerk user to MongoDB",
        });
      }
    }

    res.json({
      success: true,
      message: "Created user added to MongoDB",
    });
  }
);

router.all(
  "/modify",
  async (req: Request, res: Response, next: NextFunction) => {
    if (!process.env.SIGNING_SECRET_MODIFY) {
      throw new Error("Set SIGNING_SECRET in .env");
    }

    const evt = setupWebhook(req, res, process.env.SIGNING_SECRET_MODIFY);

    if (typeof evt === "string") {
      return void res.status(400).json({ success: false, message: evt });
    }

    try {
      await User.updateOne(
        { clerkId: evt.data.id },
        { username: evt.data.username }
      );
    } catch (error: any) {
      if (error instanceof Error) {
        console.error(
          "Error: could not modify username to MongoDB: ",
          error.message
        );
        return void res
          .status(400)
          .json({ success: false, message: error.message });
      } else {
        console.error(
          "Unknown error has occurred when modifying Clerk username to MongoDB"
        );
        return void res.status(400).json({
          success: false,
          message:
            "Unknown error has occurred when modifying Clerk username to MongoDB",
        });
      }
    }

    res.json({
      success: true,
      message: "Modified username added to MongoDB",
    });
  }
);

function setupWebhook(req: Request, res: Response, secret: string) {
  const wh = new Webhook(secret);

  const svix_signature = req.headers["svix-signature"];
  const svix_id = req.headers["svix-id"];
  const svix_timestamp = req.headers["svix-timestamp"];

  if (!svix_id || !svix_signature || !svix_timestamp) {
    return "Error: Missing svix headers";
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
      return error.message;
    } else {
      console.error("Unknown error has occurred when verifying webhook.");
      return "Unknown error has occurred when verifying webhook.";
    }
  }

  return evt;
}

export default router;
