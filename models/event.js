const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventSchema = new Schema({
    // active: {type: Boolean, required: [true]},
    title: {type: String, required: [true, 'cannot be empty']},
    time: {type: String},
    admission: {type: String},
    description: {type: String, required: [true, 'cannot be empty']},
    location: {type: String, required: [true, 'cannot be empty']},
    date: {type: Date, required: [true, 'cannot be empty']},
    imagePath: {type: String, required:[true, 'image is required']},
    numInterested: {type: Number, default: 0, required:[true, 'numInterested is required']},
    hostUser: {type: Schema.Types.ObjectId, ref: 'User'}
});

module.exports = mongoose.model('Event', eventSchema);
