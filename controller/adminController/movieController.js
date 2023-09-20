const MovieModel = require('../../models/movieModel');


//...........................ADDING-MOVIE-FROM-TMDB-API-TO-DATABASE.........................................
const addMovie = async(req,res)=>{
    try{
      const {movie} = req.body
      await MovieModel.create({
        tmdbId:movie.id,
        adult:movie.adult,
        backdrop_path:movie.backdrop_path,
        genre_ids:movie.genre_ids,
        original_language:movie.original_language,
        original_title:movie.original_title,
        overview:movie.overview,
        popularity:movie.popularity,
        poster_path:movie.poster_path,
        release_date:movie.release_date,
        title:movie.title,
        video:movie.video,
        vote_average :movie.vote_average,
        vote_count:movie.vote_count
      })

      res.status(200).json({message:'Movie added successfully'})


    }catch (err){
        res.status(500).json({errmsg:"server error"})
        console.error('addmovie: ',err)
    }
}


// .............................GET-MOVIES-already added in database..................................................
const getMovies = async(req,res)=>{
 try{
    const addedMovies = await MovieModel.find({})
    res.status(200).json({addedMovies})
 }catch (err){
    res.status(500).json({errmsg:'Server Error'})
    console.error('getMovies',err)
 }
}

// .................................LIST-AND-UNLIST-MOVIES..................................
const unlistMovie = async (req,res)=>{
  try{
    const {unListed} = req.body
    const {movieId} = req.params

    if(unListed){
     await MovieModel.updateOne({_id:movieId},{$set:{unListed:false}});
     return res.status(200).json({message:"Movie listed successfully"})
    }else{
      await MovieModel.updateOne({_id:movieId},{$set:{unListed:true}});
      return res.status(200).json({message:"Movie unlisted"})
    }

  }catch (err){
    console.error("unlistMovie",err)
  }
}

module.exports = {
    addMovie,
    getMovies,
    unlistMovie
}