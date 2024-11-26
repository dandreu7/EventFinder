const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reservationSchema = new Schema({
    user: {type: Schema.Types.ObjectId, ref: 'User', required: [true, 'user is required']},
    event: {type: Schema.Types.ObjectId, ref: 'Event', required: [true, 'event is required']}
});

module.exports = mongoose.model('Reservation', reservationSchema);
