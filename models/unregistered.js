const mongoose = require('mongoose');
const unregisteredSchema = new mongoose.Schema({
    admission_number: {
        type: String,
        required: true,
    },
    event: {
        type: Number,
        required: true
    }
})

const unregistered= mongoose.model('unregistered',unregisteredSchema);
module.exports = unregistered;