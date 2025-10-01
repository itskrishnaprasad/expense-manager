import Category from "../models/categoryModel.js";
import Transaction from "../models/transactionModel.js";

// @desc    Display the category management page
// @route   GET /categories
// @access  Private
export const getCategoryPage = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const [incomeCategories, expenseCategories] = await Promise.all([
      Category.find({ user: userId, type: "income" }).sort({ name: 1 }),
      Category.find({ user: userId, type: "expense" }).sort({ name: 1 }),
    ]);

    res.render("pages/categories", {
      title: "Manage Categories",
      incomeCategories,
      expenseCategories,
    });
  } catch (error) {
    console.error(error);
    req.flash("error_msg", "Error loading categories page.");
    res.redirect("/dashboard");
  }
};

// @desc    Create a new category
// @route   POST /categories
// @access  Private
export const createCategory = async (req, res) => {
  try {
    const { name, type } = req.body;
    const userId = req.session.user.id;

    if (!name || !type) {
      req.flash("error_msg", "Please provide a name and type.");
      return res.redirect("/categories");
    }

    // Check if category already exists for this user and type
    const existingCategory = await Category.findOne({
      name,
      type,
      user: userId,
    });
    if (existingCategory) {
      req.flash(
        "error_msg",
        "Category with this name and type already exists."
      );
      return res.redirect("/categories");
    }

    const newCategory = new Category({
      name,
      type,
      user: userId,
      isDefault: false, // Custom categories are never default
    });

    await newCategory.save();
    req.flash("success_msg", "Category created successfully.");
    res.redirect("/categories");
  } catch (error) {
    console.error(error);
    req.flash("error_msg", "Something went wrong.");
    res.redirect("/categories");
  }
};

// @desc    Update a category
// @route   POST /categories/update/:id
// @access  Private
export const updateCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const categoryId = req.params.id;
    const userId = req.session.user.id;

    const category = await Category.findOne({ _id: categoryId, user: userId });

    if (!category) {
      req.flash("error_msg", "Category not found or you are not authorized.");
      return res.redirect("/categories");
    }

    // IMPORTANT: Prevent updating default categories
    if (category.isDefault) {
      req.flash("error_msg", "Default categories cannot be modified.");
      return res.redirect("/categories");
    }

    category.name = name;
    await category.save();
    req.flash("success_msg", "Category updated successfully.");
    res.redirect("/categories");
  } catch (error) {
    console.error(error);
    req.flash("error_msg", "Something went wrong.");
    res.redirect("/categories");
  }
};

// @desc    Delete a category
// @route   POST /categories/delete/:id
// @access  Private
export const deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const userId = req.session.user.id;

    const category = await Category.findOne({ _id: categoryId, user: userId });

    if (!category) {
      req.flash("error_msg", "Category not found or you are not authorized.");
      return res.redirect("/categories");
    }

    // IMPORTANT: Prevent deleting default categories
    if (category.isDefault) {
      req.flash("error_msg", "Default categories cannot be deleted.");
      return res.redirect("/categories");
    }

    // Check if the category is used in any transactions
    const transaction = await Transaction.findOne({ category: categoryId });
    if (transaction) {
      req.flash(
        "error_msg",
        "Cannot delete category as it is used in existing transactions."
      );
      return res.redirect("/categories");
    }

    await category.deleteOne();
    req.flash("success_msg", "Category deleted successfully.");
    res.redirect("/categories");
  } catch (error) {
    console.error(error);
    req.flash("error_msg", "Something went wrong.");
    res.redirect("/categories");
  }
};
