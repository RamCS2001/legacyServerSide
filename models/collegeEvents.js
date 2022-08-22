const mongoose = require('mongoose');
const collegeEventsSchema = new mongoose.Schema({
    college: {
        type: String,
        required: true,
    },
    asyoulikeit: {
        type: Number,
        default: 0,
    },
    bestmanager: {
        type: Number,
        default: 0,
    },
    solosinging: {
        type: Number,
        default: 0,
    },
    solodance: {
        type: Number,
        default: 0,
    },
    soloinstrumental: {
        type: Number,
        default: 0,
    },
    pixie: {
        type: Number,
        default: 0,
    },
    pencilsketching: {
        type: Number,
        default: 0,
    },
    yoga: {
        type: Number,
        default: 0,
    },
    ezhuthaani: {
        type: Number,
        default: 0,
    },
    divideandconquer: {
        type: Number,
        default: 0,
    },
    tressurehunt: {
        type: Number,
        default: 0,
    },
    themissingpiece: {
        type: Number,
        default: 0,
    },
    radiomirchi: {
        type: Number,
        default: 0,
    },
    englishpotpourri: {
        type: Number,
        default: 0,
    },
    lyricalhunt: {
        type: Number,
        default: 0,
    },
    tamilpotpourri: {
        type: Number,
        default: 0,
    },
    cinmatrix: {
        type: Number,
        default: 0,
    },
    quiz: {
        type: Number,
        default: 0,
    },
    groupdance: {
        type: Number,
        default: 0,
    },
    postermaking: {
        type: Number,
        default: 0,
    },
    rangoli: {
        type: Number,
        default: 0,
    },
    dramatix: {
        type: Number,
        default: 0,
    },
});

const collegeEvents= mongoose.model('collegeEvents',collegeEventsSchema);
module.exports = collegeEvents;