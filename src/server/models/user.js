const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    username: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
    },
    passwordConf: {
        type: String,
        required: true,
    },
    recurlyAccount: {
        type: String,
        required: true
    }
})

//authenticate input against database
UserSchema.statics.authenticate = (username, password, callback) => {
    User.findOne({ username })
        .exec((err, user) => {
            if (err) {
                return callback(err)
            } else if (!user) {
                const err = new Error('User not found.')
                err.status = 401
                return callback(err)
            }
            bcrypt.compare(password, user.password, (err, result) => {
                if (result === true) {
                    return callback(null, user)
                } else {
                    return callback()
                }
            })
        })
}

//hashing a password before saving it to the database
UserSchema.pre('save', function (next) {
    const user = this
    bcrypt.hash(user.password, 10, (err, hash) => {
        if (err) {
            return next(err)
        }
        user.password = hash
        next()
    })
})


const User = mongoose.model('User', UserSchema)
module.exports = User
