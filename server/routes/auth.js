import express from "express";
import { register, login, getProfile, updateProfile } from "../controllers/users.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login",    login);
router.get("/profile",   protect, getProfile);
router.patch("/profile", protect, updateProfile);

export default router;
