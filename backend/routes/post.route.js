import express from "express";
import { protectedRoute } from "../middlewares/auth.middleware.js";
import { createPost, getFeedPosts } from "../controllers/post.controller.js";

const router = express.Router();

router.get("/", protectedRoute, getFeedPosts);
router.post("/create", protectedRoute, createPost);

export default router;
