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
    dayoneAccomodation: {
        type: Boolean,
        default: false
    },
    daytwoAccomodation: {
        type: Boolean,
        default: false
    },
    accommodationFeesPayment: {
        type: Boolean,
        default: false
    },
    tamildebate: {
        type: Number,
        default: 0,
    },
    martialarts : {
        type: Number,
        default: 0,
    },
    bestmanager : {
        type: Number,
        default: 0,
    },
    voiceoflegacy : {
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
    debateguru : {
        type: Number,
        default: 0,
    },
    makeyourmove : {
        type: Number,
        default: 0,
    },
    extempore  : {
        type: Number,
        default: 0,
    },
    pencilsketching  : {
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
    },
    date:{
        type: Date,
        default: Date.now
    }
});

const User= mongoose.model('User',UserSchema);
module.exports = User;