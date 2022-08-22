const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    gender: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phone_number: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    college: {
        type: String,
        required: true,
    },
    otherCollege: {
        type: String,
        required: false
    },
    year: {
        type: String,
        required: true,
    },
    degree: {
        type: String,
        required: true,
    },
    department: {
        type: String,
        required: true,
    },
    regFeesPayment: {
        type: Boolean,
        default: false
    },
    accommodationRequirement: {
        type: Boolean,
        default: false
    },
    accommodationRequirementSubmitted: {
        type: Boolean,
        default: false
    },
    accommodationFeesPayment: {
        type: Boolean,
        default: false
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
    date:{
        type: Date,
        default: Date.now
    }
});

const User= mongoose.model('User',UserSchema);
module.exports = User;