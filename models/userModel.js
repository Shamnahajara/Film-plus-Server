const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: Number
    },
    password: {
        type: String
    },
    profileImage: {
        type: String,
        default:"https://imgs.search.brave.com/cq-_goCh8MtEwBvZNOacpmXYGYAa1mlBz910zXrG0KU/rs:fit:500:0:0/g:ce/aHR0cHM6Ly9jZG4u/cGl4YWJheS5jb20v/cGhvdG8vMjAxNS8x/MC8wNS8yMi8zNy9i/bGFuay1wcm9maWxl/LXBpY3R1cmUtOTcz/NDYwXzY0MC5wbmc"
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    movieId:[ {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Movies",
      }],
    favoriteGenre: {
        type: String
    },
    workingAs: {
        type: String
    },
    preferredLanguage: {
        type: String
    },
    communitymember:{
        type:Boolean,
        default:false
    }
},
{
    timestamps:true
}
)

module.exports = mongoose.model('User', userSchema)
