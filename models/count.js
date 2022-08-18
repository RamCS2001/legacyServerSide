const mongoose = require('mongoose');
const countSchema = new mongoose.Schema({
    college: {
        type: String
    },
    numberOfParticipants: {
        type: Number,
    }
})
const count= mongoose.model('count',countSchema);
module.exports = count;