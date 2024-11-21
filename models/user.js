const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

const userSchema = new Schema({
    firstName: {type: String, required: [true, 'cannot be empty']},
    lastName: {type: String, required: [true, 'cannot be empty']},
    email: {type: String, required: [true, 'cannot be empty'], unique: true},
    password: {type: String, required: [true, 'cannot be empty']}
});

//encrypt passwords using hash before saving to database
userSchema.pre('save', function(next){
    let user = this;
    if(!user.isModified('password')) {
        return next();
    } else {
        bcrypt.hash(user.password, 10) //arguments: plaintext password, cost modifier(int)
        .then(hash=>{
            user.password = hash;
            next();
        })
        .catch(err=>next(err));
    }
});

//method to compare login password to stored hash
userSchema.methods.comparePassword = function(loginPassword) {
    return bcrypt.compare(loginPassword, this.password); //user object calls function, therefore this.password works
}

module.exports = mongoose.model('User', userSchema);
