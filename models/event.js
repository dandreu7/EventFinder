const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventSchema = new Schema({
    name: {type: String, required: [true, 'cannot be empty']},
    date: {type: Date, required:[true, 'date is required']},
    location: {type: String, required:[true, 'location is required']},
    description: {type: String, required: [true, 'cannot be empty']},
    image: {type: String, required:[true, 'image is required']},
    hostUser: {type: Schema.Types.ObjectId, ref: 'User'}
});

module.exports = mongoose.model('Event', eventSchema);
