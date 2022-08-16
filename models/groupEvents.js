const mongoose = require('mongoose');
const participant= new mongoose.Schema({
    name: {
        type: String
    },
    admission_number: {
        type: String
    },
    roll_number: {
        type: String
    }
})
const groupEventsSchema = new mongoose.Schema({
    teamname: {
        type: String,
        required: true
    },
    event: {
        type: Number,
        required: true
    },
    participants: [participant]
})

const groupEvents= mongoose.model('groupEvents',groupEventsSchema);
module.exports = groupEvents;