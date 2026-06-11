import express from "express";
import rateLimit from "express-rate-limit";
import { register, login } from "../controllers/users.js";

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skip: () => process.env.NODE_ENV === "test",
  message: { message: "Too many requests, please try again later" },
});

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);

export default router;
