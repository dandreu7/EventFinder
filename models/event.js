const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventSchema = new Schema({
    title: {type: String, required: [true, 'cannot be empty']},
    description: {type: String, required: [true, 'cannot be empty']},
    location: {type: String, required: [true, 'cannot be empty']},
    date: {type: Date, required: [true, 'cannot be empty']},
    imagePath: {type: String, required:[true, 'image is required']},
    numInterested: { type: Number, default: 0 },
    userEmail: {type: String, required:[true]},
});

eventSchema.virtual('isActive').get(function() {
    const oneDayInFuture = new Date();
    oneDayInFuture.setDate(oneDayInFuture.getDate() - 2); // Add 1 day to the current date
    return this.date > oneDayInFuture;
  });

module.exports = mongoose.model('Event', eventSchema);
