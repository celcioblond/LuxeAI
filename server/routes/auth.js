import express from "express";
import {
  register,
  login,
} from "../controllers/users.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

//get profile
//update profile

export default router;
