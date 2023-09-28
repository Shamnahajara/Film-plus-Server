const MovieModel = require('../../models/movieModel');
const ReviewModel = require('../../models/reviewModel');
const UserModel = require('../../models/userModel');
const mongoose = require('mongoose');


// .................................LISTING OF MOVIES ON THE BASE OF POPULARITY......................................
const listPopularMovies = async (req, res) => {
    try {
        const popularMovies = await MovieModel.find()
            .where('adult').equals(false) 
            .where('video').equals(false) 
            .sort('-popularity') 

        res.status(200).json({popularMovies:popularMovies});
    } catch (err) {
        console.error('listPopularMovies', err);
    }
}

// .......................................LISTING TOP RATED MOVIES....................................................
const listTopRatedMovies = async (req,res)=>{
    try{
        const topRatedMovies = await MovieModel.find()
            .where('adult').equals(false)
            .where('video').equals(false) 
            .where('vote_count').gte(200) 
            .sort('-vote_average')

          res.status(200).json({topratedMovies:topRatedMovies})

    }catch (err){
        console.error("listTopratemovies",err)
    }
}

//...........................................single movie details..................................................
const singleMovie = async (req,res)=>{
    try{

        const {movieId} = req.params
        console.log('here',movieId)
        const movie = await MovieModel.findOne({_id:movieId})
        return res.status(200).json({movie:movie})
    }catch (err){
        console.error('singleMovie :',err)
    }

}

// ...........................................ADD-TO-FAVORITE.......................................................\\\
const addToFavorite = async (req, res) => {
  try {
    const { userId, movieId } = req.body;
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { $addToSet: { movieId: movieId } }, 
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ errmsg: 'User not found' });
    }

    res.status(200).json({ message: 'Movie Added to Favorites' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ errmsg: 'Server Error' });
  }
};



  
  // ..........................................LISTING-OF-FAVORITES.......................................................\\\
  
  const getFavoriteMovies = async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await UserModel.findOne({ _id: userId }).populate('movieId');
  
      if (user) {
        const favoriteMovies = user.movieId; 
        res.status(200).json({ favoriteMovies:favoriteMovies });
      } else {
        res.status(404).json({ errmsg: 'User not found' });
      }
    } catch (err) {
      console.error('Error fetching user:', err);
      res.status(500).json({ errmsg: 'Server Error' });
    }
  };
  
  
  
  // ............................................DELETE-FROM-FAVORITES...............................................\\\
  
  const deleteFavorite = async (req,res) => {
   try{
   
    const {movieId,userId} = req.body
    const result = await UserModel.updateOne({_id: userId},{ $pull: {movieId: movieId}})
    
    if(result){
      res.status(200).json({message:'movie deleted from favorites'})
    }else{
      res.status(403).json({errmsg:"error occured"})
    }
  
   }catch (err){
    console.error("error:", err)
    res.status(500).json({errmsg:'Server Error'})
   }
  }
  
  
  
  // ......................................ADD-REVIEW-FOR-PRODUCT....................................................\\
  
  const addReview = async (req,res)=>{
    try{
      const {userId,movieId,rating,review} = req.body
      const reviews = await ReviewModel.create({userId,movieId,rating,review});
  
      if(reviews){
        res.status(200).json({message:'Review added successfully'})
      }else{
        res.status(403).json({errmsg:'Cant update your review'})
      }
  
    }catch (err){
      res.status(500).json({errmsg:'Server Error'})
      console.error("Error: ",err)
    }
  }
  
  
  // ............................................LIST-MOVIES-REVIEWS............................................................\\
  
  const getReviews = async (req, res) => {
    try {
        const movieId = req.params.movieId; 
        const reviews = await ReviewModel.find({ movieId: movieId }).populate('userId').populate('movieId');
        console.log("reviews",reviews)
        if (reviews) {
            return res.status(200).json({ reviews });
        }
    } catch (err) {
        console.error('errorreview:', err);
        res.status(500).json({ errmsg: 'Internal Server Error' });
    }
  };
  

//...............................................AVERAGE RATING OF A MOVIE.................................................

const calculateAverageRatingForMovie = async (req, res) => {
  try {
    const movieId = req.params.movieId; 
    const aggregateResult = await ReviewModel.aggregate([
      {
        $match: { movieId: new mongoose.Types.ObjectId(movieId) }
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" }
        }
      }
    ]);
    if (aggregateResult.length === 0) {
      return res.status(404).json({ error: "No reviews found for the specified movie." });
    }
    const averageRating = aggregateResult[0].averageRating;
    res.json({ averageRating });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while calculating the average rating." });
  }
};


// .............................GET-MOVIES- in database..................................................
const getMovies = async(req,res)=>{
  try{
     const addedMovies = await MovieModel.find({})
     res.status(200).json({addedMovies})
  }catch (err){
     res.status(500).json({errmsg:'Server Error'})
     console.error('getMovies',err)
  }
 }





module.exports = {
     listPopularMovies,
     listTopRatedMovies,
     singleMovie,
     addReview,
     getReviews,
     addToFavorite,
     deleteFavorite,
     getFavoriteMovies,
     calculateAverageRatingForMovie,
     getMovies
     };








