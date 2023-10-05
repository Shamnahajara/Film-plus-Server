const adminModel = require('../../models/adminModel')
const UserModel = require('../../models/userModel');
const MovieModel = require('../../models/movieModel');
const ProductModel = require('../../models/productModel')
const {generateToken} = require('../../middleware/auth');


// .................................ADMIN-LOGIN.....................
const adminLogin = async (req,res)=>{
    try{
        const {email,password} = req.body
        const admin = await adminModel.findOne({$and:[{email},{password}]})
        if(admin){
          const token = generateToken(admin._id,'admin');
          return res.status(200).json({message:'Admin login Successful',name:admin.name,role:'admin',token})
        }else{
          return res.status(409).json({errmsg:'You Are not an admin'})
        }

    }catch (err){
        return res.status(500).json({errmsg:'Server error'})
    }

}


const cardData = async(req,res)=>{
  try{
    const usersCount = await UserModel.countDocuments();
    const  movieCount = await MovieModel.countDocuments();
    const  productCount = await ProductModel.countDocuments();

    res.status(200).json({users:usersCount,movies:movieCount,products:productCount})

  }catch (err){
   console.error("cardData",cardData);
  }
}

const latestMovies  = async(req,res)=>{
  try{
    const recent = await MovieModel.find({})
    .sort({ _id: -1 })
    .limit(5);
    res.status(200).json({recentMovies:recent});
  }catch (err){
    console.error('latestMovies',err)
  }
}


module.exports = {
    adminLogin,
    cardData,
    latestMovies
}
