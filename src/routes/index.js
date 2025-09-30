import { render } from "ejs";
import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  res.render("pages/landing", { title: "Welcome" });
});

export default router;
