const ProductModel = require('../../models/productModel');

const getProducts = async (req,res)=>{
    try{
        const products = await ProductModel.find({})
        if(products){
            res.status(200).json({products})
        }

    }catch (err){
        res.status(500).json({errmsg:'Server Error'})
        console.error('getProducts'+err)
    }
}


const unlistProduct = async (req,res)=>{
    try{
      const {productId} = req.params
      const {isUnlisted} = req.body
      if(isUnlisted){
        await ProductModel.findOneAndUpdate({_id:productId},{$set:{isUnlisted:false}})
        res.status(200).json({message:'product listed successfully'})
      }else{
        await ProductModel.findOneAndUpdate({_id:productId},{$set:{isUnlisted:true}})
        res.status(200).json({message:'Product unlisted successfully'})
      }
    }catch (err){
      res.status(500).json({errmsg:'Server error'})
      console.error('unlistProduct :',err)
    }
  }

module.exports = {
    getProducts,
    unlistProduct
}