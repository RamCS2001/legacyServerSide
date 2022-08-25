const mongoose = require('mongoose');
const payment = new mongoose.Schema( { email: { type: String , required: true } ,  paymentHash: { type: String , required: true } } );
const paymentHash = mongoose.model('paymentHash',payment);
module.exports = paymentHash;