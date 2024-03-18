const mongoose = require('mongoose')
const { Schema } = mongoose;

const orderSchema = new Schema({

    order_id: String,
    payment_id: String,
    status: String,
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    }
})

module.exports = mongoose.model('orders', orderSchema);