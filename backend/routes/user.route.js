import express from "express";
import { protectedRoute } from "../middlewares/auth.middleware.js";
import {
  getPublicProfile,
  getSuggestedConnections,
} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/suggestions", protectedRoute, getSuggestedConnections);
router.get("/:username", protectedRoute, getPublicProfile);

export default router;
