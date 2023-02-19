import express from "express";
import { protectedRoute } from "../middlewares/auth.middleware";

const router = express.Router();

router.post('/request/":userId', protectedRoute, sendConnectionRequest);
router.put('/request/":requestId', protectedRoute, acceptConnectionRequest);
router.put('/request/":requestId', protectedRoute, rejectConnectionRequest);

router.get("/requests", protectedRoute, getConnectionRequests);
router.get("/", protectedRoute, getUserConnections);
router.delete("/:userId", protectedRoute, removeConnection);
router.get("/status/:userId", protectedRoute, getConnectionStatus);

export default router;
