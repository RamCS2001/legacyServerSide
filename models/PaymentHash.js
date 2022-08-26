const mongoose = require('mongoose');
const payment = new mongoose.Schema( { email: { type: String , required: true } ,  success: { type: String , required: true } , failure: { type: String , required: true } } );
const paymentHash = mongoose.model('paymentHash',payment);
module.exports = paymentHash;