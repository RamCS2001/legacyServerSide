const mongoose = require('mongoose');
const collegeEventsSchema = new mongoose.Schema({
    college: {
        type: String,
        required: true,
    },
    tamildebate: {
        type: Number,
        default: 0,
    },
    martialarts: {
        type: Number,
        default: 0,
    },
    bestmanager: {
        type: Number,
        default: 0,
    },
    voiceoflegacy: {
        type: Number,
        default: 0,
    },
    musicunplugged: {
        type: Number,
        default: 0,
    },
    kavithaigal: {
        type: Number,
        default: 0,
    },
    pixie: {
        type: Number,
        default: 0,
    },
    yoga: {
        type: Number,
        default: 0,
    },
    debateguru: {
        type: Number,
        default: 0,
    },
    makeyourmove: {
        type: Number,
        default: 0,
    },
    extempore: {
        type: Number,
        default: 0,
    },
    pencilsketching: {
        type: Number,
        default: 0,
    },
    symphonique: {
        type: Number,
        default: 0,
    },
    divideandconquer: {
        type: Number,
        default: 0,
    },
    monstersmuss: {
        type: Number,
        default: 0,
    },
    kalakkalkalatta: {
        type: Number,
        default: 0,
    },
    sherlockholmes: {
        type: Number,
        default: 0,
    },
    quizzards: {
        type: Number,
        default: 0,
    },
    rangoli: {
        type: Number,
        default: 0,
    },
    graphix: {
        type: Number,
        default: 0,
    },
    choreoboom: {
        type: Number,
        default: 0,
    },
    ideapresentation: {
        type: Number,
        default: 0,
    },
    marketomania: {
        type: Number,
        default: 0,
    },
    dramatics: {
        type: Number,
        default: 0,
    },
    cinematrix: {
        type: Number,
        default: 0,
    },
    liphomaniac: {
        type: Number,
        default: 0,
    },
    expressions: {
        type: Number,
        default: 0,
    },
    treasurehunt: {
        type: Number,
        default: 0,
    },
    warwithwords: {
        type: Number,
        default: 0,
    },
    translation: {
        type: Number,
        default: 0,
    },
    lyricalhunt: {
        type: Number,
        default: 0,
    }
});

const collegeEvents= mongoose.model('collegeEvents',collegeEventsSchema);
module.exports = collegeEvents;