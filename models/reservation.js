const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reservationSchema = new Schema({
    user: {type: Schema.Types.ObjectId, ref: 'User', required: [true, 'user is required']},
    event: {type: Schema.Types.ObjectId, ref: 'Event', required: [true, 'event is required']},
    status: {type: String, enum: {values:['pending', 'rejected', 'accepted']}, default: 'pending', required:[true, 'status is required']}
});

module.exports = mongoose.model('Reservation', reservationSchema);
