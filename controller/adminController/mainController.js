const adminModel = require('../../models/adminModel')
const {generateToken} = require('../../middleware/auth')


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


module.exports = {
    adminLogin
}
