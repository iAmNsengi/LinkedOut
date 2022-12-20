import express from "express";
import { protectedRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", protectedRoute, getPosts);

export default router;
