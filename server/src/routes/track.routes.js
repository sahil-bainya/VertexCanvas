import { Router } from "express";
import { trackVisit } from "../controllers/track.controller.js";

const router = Router();
router.post("/visit", trackVisit);

export default router;
