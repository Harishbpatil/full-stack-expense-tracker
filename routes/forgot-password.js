const express = require("express");
const router = express.Router();
const Brevo = require("@getbrevo/brevo");
require("dotenv").config();
const bcrypt = require("bcrypt");

const User = require("../models/user");
const ResetPassword = require("../models/resetPassword");

const sequelize = require("../util/db");

router.post("/forgot-password", async (req, res) => {
  try {
    const email = req.body.email;
    const user = await User.findOne({
      where: { email: email },
      include: [{ model: ResetPassword }],
    });

    console.log(user);
    if (!user) {
      return res.status(404).json({ success: false, msg: "Email not found" });
    }

    Brevo.ApiClient.instance =
      Brevo.ApiClient.instance ?? new Brevo.ApiClient();

    var apiKey = Brevo.ApiClient.instance.authentications["api-key"];
    apiKey.apiKey = process.env.BREVO_API_KEY;

    var apiInstance = new Brevo.TransactionalEmailsApi();

    const sender = { email: "harishbpatil1998@gmail.com" };

    const receiver = [
      {
        email: req.body.email,
      },
    ];
    const link = await user.createResetPassword();

    const response = await apiInstance.sendTransacEmail({
      sender,
      to: receiver,
      subject: "testing",
      htmlContent:
        "<p>Click the link to reset your password</p>" +
        `<a href="http://127.0.0.1:4000/reset-password.html?reset=${link.id}">click here</a>`,
    });
    return res.json({ success: true, link });
  } catch (e) {
    console.log(e);
    return res
      .status(500)
      .json({ success: false, msg: "Internal server error" });
  }
});

router.post("/reset-password/:resetId", async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const resetId = req.params.resetId;
    const newPassword = req.body.newPassword;
    const confirmPassword = req.body.confirmPassword;

    const resetUser = await ResetPassword.findByPk(resetId);

    if (!resetUser || !resetUser.isActive) {
      return res
        .status(401)
        .json({ success: false, msg: "Invalid or expired link" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(403).json({
        success: false,
        msg: "New and confirm passwords are different",
      });
    }

    const user = await resetUser.getUser();
    const hash = await bcrypt.hash(newPassword, 10);

    await user.update({ password: hash }, { transaction: t });
    await resetUser.update({ isActive: false }, { transaction: t });

    await t.commit();

    return res.json({ success: true, msg: "Password changed successfully" });
  } catch (e) {
    console.error(e);
    await t.rollback();
    return res
      .status(500)
      .json({ success: false, msg: "Internal server error" });
  }
});

router.get("/check-password-link/:resetId", async (req, res) => {
  try {
    const resetUser = await ResetPassword.findByPk(req.params.resetId);

    if (!resetUser) {
      return res.status(404).json({ success: false, msg: "Invalid link" });
    }

    return res.json({ isActive: resetUser.isActive });
  } catch (e) {
    console.error(e);
    return res
      .status(500)
      .json({ success: false, msg: "Internal server error" });
  }
});

module.exports = router;
