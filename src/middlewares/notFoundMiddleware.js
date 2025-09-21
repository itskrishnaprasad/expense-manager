export default (req, res, next) => {
  res.status(404).render("pages/404", { title: "Page Not Found" });
};
