const userModel = require('../../models/userModel')
const {generateToken} = require('../../middleware/auth')

const users = async (req,res)=>{
    try{
        const users = await userModel.find({})
         return res.status(200).json({users})

    }catch (err){
        return res.status(500).json({errmsg:'Server error'})
    }
}

const userStatus = async (req,res)=>{
    try{
        const {userId,blocked} = req.body
        if(blocked){
            await userModel.updateOne({_id:userId},{$set:{isBlocked:false}})
            return res.status(200).json({message:'Selected user Un-Blocked',isblocked:false})
        }else{
            await userModel.updateOne({_id:userId},{$set:{isBlocked:true}})
            return res.status(200).json({message:'Selected user blocked',isblocked:true})
        }
    }catch (err){
        return res.status(500).json({errmsg:'Server error'})
    }
}

module.exports = {
    users,
    userStatus
}