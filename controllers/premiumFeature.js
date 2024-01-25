const Sequelize = require("sequelize");
const Expense = require("../models/expense");
const User = require("../models/user");

exports.getUserLeaderboard = async (req, res) => {
  try {
    if (true) {
      const result = await User.findAll({
        attributes: [
          "id",
          "name",
          [
            Sequelize.fn(
              "COALESCE",
              Sequelize.literal("SUM(`expenses`.`expense`)"),
              0
            ),
            "total",
          ],
        ],
        include: [
          {
            model: Expense,
            attributes: [],
          },
        ],
        group: [`User.id`],
        order: [[Sequelize.literal("total"), "DESC"]],
      });
      return res.json(result);
    } else {
      return res
        .status(403)
        .json({ success: false, msg: "you are not a premium user" });
    }
  } catch (e) {
    console.error(e);
    return res
      .status(500)
      .json({ success: false, msg: "Internal server error" });
  }
};
