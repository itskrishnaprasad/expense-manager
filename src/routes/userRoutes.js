import express from "express";
const router = express.Router();

// importing controllers 
import {
  getRegister,
  postRegister,
  getLogin,
  postLogin,
  getDashboard,
  getLogout,
} from "../controllers/authController.js";

// importing middleware controller 
import { isLoggedIn } from "../middlewares/authMiddleware.js";

// Auth Routes
router.get("/register", getRegister);
router.post("/register", postRegister);
router.get("/login", getLogin);
router.post("/login", postLogin);
router.get("/logout", getLogout);

// Protected Dashboard Route
router.get("/dashboard", isLoggedIn, getDashboard);

export default router;
