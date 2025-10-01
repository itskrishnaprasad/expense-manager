import User from "../models/userModel.js"; // importing userSchema
import Transaction from "../models/transactionModel.js";
import bcrypt from "bcrypt"; // for hasing user password

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

// Show user dashboard
export const getDashboard = async (req, res) => {
  try {
    // Find all transactions for the logged-in user
    const transactions = await Transaction.find({
      user: req.session.user.id,
    }).sort({ date: -1 }); // Sort by date, newest first

    res.render("pages/dashboard", {
      title: "Dashboard",
      transactions: transactions, // Pass transactions to the view
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
