const express = require("express");
const router = express.Router();


const premiumFeatureController = require("../controllers/premiumFeature");


router.get("/showleaderboard", premiumFeatureController.getUserLeaderboard);

module.exports = router;
