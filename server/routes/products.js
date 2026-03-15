import express from "express";
import { getAllProducts, getProductById } from "../controllers/products.js";

const router = express.Router();


router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.post("/", );

export default router;