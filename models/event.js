const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventSchema = new Schema({
    title: {type: String, required: [true, 'cannot be empty']},
    description: {type: String, required: [true, 'cannot be empty']},
    location: {type: String, required: [true, 'cannot be empty']},
    date: {type: Date, required: [true, 'cannot be empty']},
    imagePath: {type: String, required:[true, 'image is required']},
    numInterested: {type: Number, default: 0, required:[true, 'numInterested is required']},
    userEmail: {type: String, required:[true]},
});

eventSchema.virtual('isActive').get(function() {
    return this.date > new Date();
});

module.exports = mongoose.model('Event', eventSchema);
