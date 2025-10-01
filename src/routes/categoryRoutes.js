import express from "express";
import {
  getCategoryPage,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import { isLoggedIn } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All routes in this file are protected
router.use(isLoggedIn);

router.get("/", getCategoryPage);
router.post("/", createCategory);
router.post("/update/:id", updateCategory);
router.post("/delete/:id", deleteCategory);

export default router;
