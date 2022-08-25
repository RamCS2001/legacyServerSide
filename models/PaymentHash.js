const mongoose = require('mongoose');
const collegeEventsSchema = new mongoose.Schema( { email: { type: string , required: true } ,  paymentHash: { type: String , required: true } } );
const collegeEvents= mongoose.model('collegeEvents',collegeEventsSchema);
module.exports = collegeEvents;