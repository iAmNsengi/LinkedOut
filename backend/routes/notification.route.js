import express from "express";
import { protectedRoute } from "../middlewares/auth.middleware.js";
import {
  getUserNotifications,
  markNotificationAsRead,
} from "../controllers/notification.controller.js";

const router = express.Router();

router.get("/", protectedRoute, getUserNotifications);

router.put("/:id/read", protectedRoute, markNotificationAsRead);
router.delete("/:id", protectedRoute, deleteNotification);

export default router;
