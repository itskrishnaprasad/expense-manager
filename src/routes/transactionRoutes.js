// src/routes/transactionRoutes.js

import express from "express";
import {
  postTransaction,
  deleteTransaction,
} from "../controllers/transactionController.js";
import { isLoggedIn } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All routes in this file are protected by the isLoggedIn middleware
router.use(isLoggedIn);

// Route to add a new transaction
router.post("/", postTransaction);

// Route to delete a transaction
router.post("/delete/:id", deleteTransaction);

export default router;
