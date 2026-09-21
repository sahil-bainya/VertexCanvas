import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";
import {
  getStats,
  getAllUsers,
  getAllBoards,
  getBoardDetails,
  deleteUser,
  deleteBoard,
  updateUserRole,
} from "../controllers/admin.controller.js";

const router = Router();

// All routes require JWT + admin
router.use(verifyJWT);
router.use(verifyAdmin);

router.get("/stats", getStats);
router.get("/users", getAllUsers);
router.get("/boards", getAllBoards);
router.get("/boards/:boardId", getBoardDetails);
router.delete("/users/:userId", deleteUser);
router.delete("/boards/:boardId", deleteBoard);
router.patch("/users/:userId/role", updateUserRole);

export default router;