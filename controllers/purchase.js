const Razorpay = require("razorpay");
const Order = require("../models/order");
const crypto = require("crypto");
require("dotenv").config();

var rzp = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.purchaseMembership = async (req, res) => {
  try {
    var options = {
      amount: 50000,
      currency: "INR",
      receipt: "order_rcptid_11",
    };

    const order = await rzp.orders.create(options);
    await req.user.createOrder({ order_id: order.id, status: "PENDING" });

    return res.json({ order_id: order.id, key: rzp.key_id });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ msg: "Internal server error" });
  }
};

exports.successfulTransaction = async (req, res) => {
  try {
    const orders = await req.user.getOrders({ where: { status: "PENDING" } });
    const payment_id = req.body.payment_id;
    const signature = req.body.razorpay_signature;

    if (orders.length > 0) {
      const order = orders[0];
      const data = `${order.order_id}|${payment_id}`;
      const generated_signature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(data)
        .digest("hex");

      if (generated_signature === signature) {
        const payment = await rzp.payments.fetch(payment_id);

        if (payment.status === "captured") {
          order.payment_id = payment_id;
          order.status = "SUCCESSFUL";
          await order.save();

          return res.json({ success: true, msg: "Payment complete" });
        } else {
          order.payment_id = payment_id;
          order.status = "FAILED";
          await order.save();

          return res.json({ success: false, msg: "Payment failed" });
        }
      } else {
        return res.status(401).json({ msg: "Not authorized" });
      }
    } else {
      return res.status(403).json({ msg: "No order found" });
    }
  } catch (e) {
    console.log(e);
    return res.status(500).json({ msg: "Internal server error" });
  }
};

exports.failedTransaction = async (req, res) => {
  try {
    const orders = await req.user.getOrders({ where: { status: "PENDING" } });

    if (orders.length > 0) {
      const order = orders[0];
      const payment_id = req.body.payment_id;
      const payment = await rzp.payments.fetch(payment_id);

      if (payment.status === "failed") {
        order.status = "FAILED";
        order.payment_id = payment_id;
        await order.save();
        return res.json({ success: false, msg: "Transaction failed" });
      }
    } else {
      return res.status(403).json({ msg: "No order found" });
    }
  } catch (e) {
    console.log(e);
    return res.status(500).json({ msg: "Internal server error" });
  }
};
