import express from "express";
import path from "path";
import morgan from "morgan";
import { fileURLToPath } from "url";
import expressLayouts from "express-ejs-layouts";

import indexRoutes from "./routes/index.js";
import notFoundMiddleware from "./middlewares/notFoundMiddleware.js";
import errorMiddleware from "./middlewares/errorMiddleware.js";

// Fix __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(expressLayouts); // enable ejs layouts
app.set("layout", "layouts/main");

// Middleware
app.use(express.urlencoded({ extended: true })); // Parse form data
app.use(express.json()); // Parse JSON
app.use(morgan("dev")); // Logging
app.use(express.static(path.join(__dirname, "public"))); // Static assets

// Routes
app.use("/", indexRoutes);

// 404 handler
app.use(notFoundMiddleware);

// Global error handler
app.use(errorMiddleware);

export default app;
