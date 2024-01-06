const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();

const sequelize = require("./util/database");
const expenseRoutes = require("./routes/expense");

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "views")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

app.use("/expense", expenseRoutes);

sequelize
  .sync()
  .then(() => {
    app.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  })
  .catch((error) => console.error("Error syncing database:", error));
