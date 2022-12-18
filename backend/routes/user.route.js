import express from "express";
import { protectedRoute } from "../middlewares/auth.middleware.js";
import {
  getPublicProfile,
  getSuggestedConnections,
  updateProfile,
} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/suggestions", protectedRoute, getSuggestedConnections);
router.get("/:username", protectedRoute, getPublicProfile);

router.put("/profile", protectedRoute, updateProfile);

export default router;
