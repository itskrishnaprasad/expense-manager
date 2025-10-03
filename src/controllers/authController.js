import User from "../models/userModel.js"; // importing userSchema
import Transaction from "../models/transactionModel.js";
import Category from "../models/categoryModel.js";
import bcrypt from "bcrypt"; // for hasing user password
import mongoose from "mongoose";

import {
  startOfMonth,
  endOfMonth,
  sub,
  startOfYear,
  formatISO,
} from "date-fns";

// Show register page
export const getRegister = (req, res) => {
  res.render("pages/register", { title: "Register" });
};

// Handle user registration
export const postRegister = async (req, res) => {
  try {
    const { username, password } = req.body;

    // basic validation
    if (!username || !password) {
      req.flash("error_msg", "Please fill in all fields");
      return res.redirect("/register");
    }

    // checking for existing user
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      req.flash("error_msg", "Username is already taken");
      return res.redirect("/register");
    }

    // hashing password
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    // --- SEED DEFAULT CATEGORIES FOR THE NEW USER ---
    const defaultCategories = [
      // Expense Categories
      { name: "Food", type: "expense", user: newUser._id, isDefault: true },
      { name: "Rent", type: "expense", user: newUser._id, isDefault: true },
      { name: "Travel", type: "expense", user: newUser._id, isDefault: true },
      {
        name: "Groceries",
        type: "expense",
        user: newUser._id,
        isDefault: true,
      },
      // Income Categories
      { name: "Salary", type: "income", user: newUser._id, isDefault: true },
      { name: "Freelance", type: "income", user: newUser._id, isDefault: true },
    ];

    await Category.insertMany(defaultCategories);

    req.flash("success_msg", "You are now registered and can log in");
    res.redirect("/login");
  } catch (error) {
    console.error(error);
    req.flash("error_msg", "Something went wrong");
    res.redirect("/register");
  }
};

// Show login page
export const getLogin = (req, res) => {
  res.render("pages/login", { title: "Login" });
};

// Handle user login
export const postLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // checking for user, else redirect to login
    const user = await User.findOne({ username });
    if (!user) {
      req.flash("error_msg", "Invalid credentials");
      return res.redirect("/login");
    }

    // checking password match, else redirect to login
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      req.flash("error_msg", "Invalid credentials");
      return res.redirect("/login");
    }

    // setting session for the user
    req.session.user = {
      id: user._id,
      username: user.username,
    };

    //directing to dashboard after successful login
    res.redirect("/dashboard");
  } catch (error) {
    console.error(error);

    // setting flash message and redirecting to login if login failed
    req.flash("error_msg", "Something went wrong");
    res.redirect("/login");
  }
};

// Show user dashboard (Simplified Version)
export const getDashboard = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { filter } = req.query;
    const now = new Date();
    let startDate, endDate;

    // --- Simplified Date Range Calculation ---
    if (filter === "prev_month") {
      const prevMonth = sub(now, { months: 1 });
      startDate = startOfMonth(prevMonth);
      endDate = endOfMonth(prevMonth);
    } else {
      // Default to this month
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
    }

    // --- Database Aggregation for Summary ---
    const summary = await Transaction.aggregate([
      // --- The Fix is here ---
      {
        $match: {
          // 2. FIX: Convert string ID to ObjectId for the aggregation query
          user: new mongoose.Types.ObjectId(userId),
          date: { $gte: startDate, $lte: endDate },
        },
      },
      { $group: { _id: "$type", total: { $sum: "$amount" } } },
    ]);

    // --- Process Aggregation Results ---
    let totalIncome = 0;
    let totalExpense = 0;
    summary.forEach((item) => {
      if (item._id === "income") totalIncome += item.total;
      else if (item._id === "expense") totalExpense += item.total;
    });
    const netBalance = totalIncome - totalExpense;

    // --- Fetch Latest 10 Transactions (Always) ---
    const recentTransactions = await Transaction.find({ user: userId })
      .sort({ date: -1 })
      .limit(10)
      .populate("category");

    // --- Fetch Categories for the Form ---
    const [incomeCategories, expenseCategories] = await Promise.all([
      Category.find({ user: userId, type: "income" }).sort({ name: 1 }),
      Category.find({ user: userId, type: "expense" }).sort({ name: 1 }),
    ]);

    res.render("pages/dashboard", {
      title: "Dashboard",
      totalIncome,
      totalExpense,
      netBalance,
      recentTransactions,
      incomeCategories,
      expenseCategories,
      currentFilter: filter || "this_month",
    });
  } catch (error) {
    console.error(error);
    req.flash("error_msg", "Error loading dashboard data.");
    res.redirect("/login");
  }
};

// Handle user logout
export const getLogout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.redirect("/dashboard");
    }
    res.redirect("/login");
  });
};
