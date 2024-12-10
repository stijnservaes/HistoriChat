import { Request, Response, Router } from "express";

const router = Router()

router.get("/token", (req: Request, res: Response) => {
  res.json({test: "test"})
})

export default router