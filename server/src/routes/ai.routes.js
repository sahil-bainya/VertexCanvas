import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  architectureAssist,
  messCleanup,
  generateCode,
} from "../controllers/ai.controller.js";
import textToDiagram from "../controllers/textToDiagram.controller.js";
const router = Router();

router.use(verifyJWT);

router.route("/assist").post(architectureAssist);
router.route("/cleanup").post(messCleanup);
router.route("/text-to-diagram").post(textToDiagram);
router.route("/generate-code").post(generateCode);

export default router;
