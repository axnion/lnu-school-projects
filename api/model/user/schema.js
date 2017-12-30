const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    lnu: { type: String, required: true, unique: true },
    github: { type: String, required: true, unique: true },
    slackUser: { type: String, required: true, unique: true }
});

module.exports = mongoose.model('User', userSchema);