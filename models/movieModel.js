const mongoose = require("mongoose");

const movieSchema = mongoose.Schema({
    tmdbId:{
        type:Number
    },
    adult:{
        type:Boolean,
        dafault:false
    },
    backdrop_path:{
        type : String,
        required : true
    },
    genre_ids: {
        type : Array,
        required :true
    },
    original_language:{
         type: String,
         required:true
    },
    
    original_title:{
        type:String,
        required:true
    },
    overview:{
        type:String,
        required : true
    },
    popularity:{
        type:Number,
        required : true
    },
    poster_path:{
        type:String,
        required:true
    },
    release_date:{
        type:Date,
        required : true
    },
    title:{
        type:String,
        required:true
    },
    video:{
        type:Boolean,
        default:false
    },
    vote_average : {
        type:Number,
        required:true
    },
    vote_count:{
        type : Number,
        required:true
    },
    unListed:{
        type:Boolean,
        dafault:false
    }
});

module.exports = mongoose.model("Movies", movieSchema);