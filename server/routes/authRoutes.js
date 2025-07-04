// server/routes/authRoutes.js

import express from "express";
import { protect } from "../middleware/auth.js";
import {
  getCurrentUser,
  register,
  login,
} from "../controllers/authController.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected route
router.get("/me", protect, getCurrentUser);

// ❌ Incorrect (commented):
// router.get('/me, protect, getCurrentUser); <-- wrong syntax

export default router;
