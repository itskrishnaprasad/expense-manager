// importing neccessary npm pkgs
import express from "express";
import dotenv from "dotenv";
dotenv.config();
import path from "path";
import morgan from "morgan";
import { fileURLToPath } from "url";
import expressLayouts from "express-ejs-layouts";
import flash from "connect-flash";
import session from "express-session";
import MongoStore from "connect-mongo";

//routes import
//user routes import
import indexRoutes from "./routes/index.js";
import userRoutes from "./routes/userRoutes.js";

//middleware routes import
import notFoundMiddleware from "./middlewares/notFoundMiddleware.js";
import errorMiddleware from "./middlewares/errorMiddleware.js";

// Fix __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// creating express app
const app = express();

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// enable ejs layouts
app.use(expressLayouts);
app.set("layout", "layouts/main");

// Middleware
app.use(express.urlencoded({ extended: true })); // Parse form data
app.use(express.json()); // Parse JSON to js types
app.use(morgan("dev")); // Logging
app.use(express.static(path.join(__dirname, "public"))); // Static assets (telling express where to find static assets)

// Initialize express-session to track user sessions and persist login state.
app.use(
  session({
    secret: "a-very-secret-key-change-in-prod",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI, // Your MongoDB connection string
      collectionName: "sessions", // Optional: name of the collection to store sessions
      ttl: 14 * 24 * 60 * 60, // Optional: time to live for sessions in seconds (14 days)
    }),
  })
);

// Connect Flash Middleware
app.use(flash());

// Global variables for views
//setting flash on req object before it reach to routes
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.user = req.session.user || null; // Make user object available in all views
  next();
});

// Routes
app.use("/", indexRoutes);
app.use("/", userRoutes);

// 404 handler
app.use(notFoundMiddleware);

// Global error handler
app.use(errorMiddleware);

// exporting app to Server.js
export default app;
