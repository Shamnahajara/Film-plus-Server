const CommunityChatModel = require('../../models/communityChatModel');


const communities = async(req,res)=>{
    try{
       const communities = await CommunityChatModel.find({isGroupchat:true}).populate('groupAdmin','-password')
       console.log("communities",communities)

       if(communities){
        res.status(200).json({communities:communities})
       }

    }catch (err){
        console.error("communities",err)
    }
}

const communityStatus = async (req,res)=>{
    try{
        const {communityId,blocked} = req.body
        if(blocked){
            await CommunityChatModel.updateOne({_id:communityId},{$set:{isBlocked:false}})
            return res.status(200).json({message:'Selected community Un-Blocked',isblocked:false})
        }else{
            await CommunityChatModel.updateOne({_id:communityId},{$set:{isBlocked:true}})
            return res.status(200).json({message:'Selected community blocked',isblocked:true})
        }
    }catch (err){
        return res.status(500).json({errmsg:'Server error'})
    }
}

module.exports = {
    communities,
    communityStatus
}