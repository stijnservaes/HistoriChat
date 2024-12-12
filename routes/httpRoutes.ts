import { Router } from "express";
import { retrieveRooms } from "../controllers/httpController";

const router = Router();

router.get("/", retrieveRooms);

export default router;
