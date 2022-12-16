import express from "express";
import { protectedRoute } from "../middlewares/auth.middleware.js";
import { getSuggestedConnections } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/suggestions", protectedRoute, getSuggestedConnections);

export default router;
