const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    lnu: { type: String, required: true },
    github: { type: String, required: true },
    slackUser: { type: String, required: true }
});

module.exports = mongoose.model('User', userSchema);