import express from "express";
import { protectedRoute } from "../middlewares/auth.middleware.js";
import {
  createComment,
  createPost,
  deletePost,
  getFeedPosts,
  getPostById,
  likeComment,
} from "../controllers/post.controller.js";

const router = express.Router();

router.get("/", protectedRoute, getFeedPosts);
router.post("/create", protectedRoute, createPost);

router.get("/:id", protectedRoute, getPostById);
router.post("/:id/comment", protectedRoute, createComment);
router.post("/:id/like", protectedRoute, likeComment);

router.delete("/delete/:id", protectedRoute, deletePost);

export default router;
