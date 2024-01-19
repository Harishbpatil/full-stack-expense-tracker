const express = require("express");
const router = express.Router();

// middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();
  } else {
    res.status(401).json({ error: "Unauthorized access" });
  }
}

router.get("/expenses", isAuthenticated, (req, res) => {
  res.json({ success: true, expenses: [] });
});

router.get("/expenses/:id", isAuthenticated, (req, res) => {
  res.json({ success: true, expense: null });
});

router.post("/expenses", isAuthenticated, async (req, res) => {
  const { amount, description, category } = req.body;

  res.status(201).json({ success: true, expense: null });
});

module.exports = router;
