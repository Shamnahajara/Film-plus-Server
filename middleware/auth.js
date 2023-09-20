const jwt = require('jsonwebtoken');
require('dotenv').config()
const userModel = require('../models/userModel');
const SECRETCODE = process.env.SECRETCODE

module.exports = {
    generateToken:(id,role)=>{
        const token = jwt.sign({id,role},SECRETCODE)
        return token
    },

    verifyUserToken:async(req,res,next)=>{
        try{
            let token = req.headers.authorization
            if(!token){
                console.log('token illa ughh')
                return res.status(403).json({errmsg:'Access denied'})
            }

            if(token.startsWith('Bearer')){
               console.log('token ind guys')
               token = token.slice(7,token.length).trimLeft()
            }

            const verified = jwt.verify(token,SECRETCODE)
            if(verified.role === 'user'){

                const user = await userModel.findOne({_id:verified.id});
                if(user.isBlocked){
                    return res.status(403).json({errmsg:'user is blocked by admin'})
                }else{
                    req.payload = verified
                    next()
                }
                }else{
                    req.status(403).json({errmsg:'Access is denied'})
                }
            }catch (error){
               res.status(500).json({errmsg:'server error'})
            }
        },

        verifyAdminToken: async(req,res,next) => {
          try{
             let token = req.headers.authorization
             if(!token){
                return res.status(403).json({errmsg:'Access Denied'})
             }
             
            if(token.startsWith('Bearer')){
                token = token.slice(7,token.length).trimLeft()
             }

             const verified = jwt.verify(token , SECRETCODE)

             if(verified.role === 'admin'){
                req.payload = verified
                next()
             }else{
                return res.status(403).json({errmsg:'Access is denied'})
             }
          }catch(err){
            console.log(err.message);
            return res.status(500).json({errmsg:'Server error'})
          }
        }
    }
    