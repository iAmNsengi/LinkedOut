import express from "express";
import { protectedRoute } from "../middlewares/auth.middleware.js";
import { getFeedPosts } from "../controllers/post.controller.js";

const router = express.Router();

router.get("/", protectedRoute, getFeedPosts);

export default router;
