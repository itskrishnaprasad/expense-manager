import Transaction from "../models/transactionModel.js";

//    Add a new transaction
export const postTransaction = async (req, res) => {
  try {
    const { type, amount, note, date } = req.body;
    const userId = req.session.user.id;

    if (!type || !amount || !date) {
      req.flash("error_msg", "Please fill in all required fields.");
      return res.redirect("/dashboard");
    }

    const newTransaction = new Transaction({
      user: userId,
      type,
      amount,
      note,
      date,
    });

    await newTransaction.save();
    req.flash("success_msg", "Transaction added successfully.");
    res.redirect("/dashboard");
  } catch (error) {
    console.error(error);
    req.flash("error_msg", "Something went wrong. Please try again.");
    res.redirect("/dashboard");
  }
};

// Delete a transaction
export const deleteTransaction = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const transactionId = req.params.id;

    // Find the transaction by its ID and ensure it belongs to the logged-in user
    const transaction = await Transaction.findOne({
      _id: transactionId,
      user: userId,
    });

    if (!transaction) {
      req.flash(
        "error_msg",
        "Transaction not found or you are not authorized."
      );
      return res.redirect("/dashboard");
    }

    await transaction.deleteOne(); // Use deleteOne() on the document
    req.flash("success_msg", "Transaction deleted successfully.");
    res.redirect("/dashboard");
  } catch (error) {
    console.error(error);
    req.flash("error_msg", "Something went wrong. Please try again.");
    res.redirect("/dashboard");
  }
};
