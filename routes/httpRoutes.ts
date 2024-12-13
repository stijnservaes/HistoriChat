import { Router } from "express";
import { retrieveChats, retrieveRooms } from "../controllers/httpController";

const router = Router();

router.get("/", retrieveRooms);
router.get("/:roomId", retrieveChats)

export default router;
