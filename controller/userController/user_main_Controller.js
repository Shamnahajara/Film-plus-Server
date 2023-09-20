const userModel = require("../../models/userModel");
const reviewModel = require('../../models/reviewModel')
const sha256 = require("js-sha256");
const {generateToken} = require('../../middleware/auth') 
const SALT = process.env.SALT;
const nodemailer = require("nodemailer");
const FRONTENDURL =process.env.FRONTEND_URL;
const RentModel = require('../../models/rentModel')
const ProductModel = require('../../models/productModel')
const EMAIL_PASS = process.env.EMAIL_PASS


// ...................................VERIFY-EMAIL.........................................\\

const sendVerifyMail = async (email, name, userId) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: "filmplusWebsite@gmail.com",
        pass: EMAIL_PASS,
      },
    });
    const mailOptions = {
      from: "filmplusWebsite@gmail.com",
      to: email,
      subject: "Email verification",
      html: `<p>Hii ${name}, please click <a href=" ${FRONTENDURL}/emailVerify/${userId}">here</a> to verify your email.</p>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log("email has been sented", info.response);
      }
    });
  } catch (err) {
    console.log(err.message);
    console.log("Email cannot be sent");
  }
};

// .......................................verify-mail..........................................

const verifyMail = async (req, res) => {
  try {
    console.log("here i am");
    const { userId } = req.params;
    await userModel.updateOne({ _id: userId }, { $set: { isVerified: true } });
    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    next(error.message);
    console.log(error.message);
  }
};

// ..................................... REGISTER...........................................\\

const register = async (req, res) => {
  try {
    let { name, email, phone, password } = req.body;
    console.log(req.body + "xcvbncvbn");
    email = email.trim();
    password = password.trim();

    const user = await userModel.findOne({ $or: [{ email }, { phone }] });
    if (user && !user.password) {
      return res
        .status(409)
        .json({ errmsg: "user already exist,try Google login" });
    } else if (user) {
      return res.status(409).json({ errmsg: "user already exist" });
    } else {
      const newUser = await userModel.create({
        name,
        email,
        phone,
        password: sha256(password + SALT),
      });
      sendVerifyMail(email, name, newUser._id);
      res.status(200).json({ message: "user registered successfully" });
    }
  } catch (error) {
    res.status(500).json({ errmsg: "server error" });
  }
};

//.. ........................................USER-LOGIN..................................................\\

const login = async (req, res) => {
  try {
    let { email, password, reMail } = req.body;
    const user = await userModel.findOne({
      $and: [{ email }, { password: sha256(password + SALT) }],
    });
    if (!user) {
      res.status(400).json({ errmsg: "Password and email is incorrect" });
    } else if (user.isBlocked) {
      res.status(403).json({ errmsg: "Account is blocked by admin" });
    } else if (user && reMail) {
      sendVerifyMail(user.email, user.name, user._id);
    } else if (!user.isVerified) {
      res.status(401).json({ errmsg: "Verify your mail" });
    } else {
      const token = generateToken(user._id, "user");
      res.status(200) .json({
          message: "user successfully login",
          name: user.name,
          token,
          userId: user._id,
          role: "user",
        });
    }
  } catch (error) {
    res.status(500).json({ errmsg: "server error" });
    console.log(error)
  }
};

// .....................................SEND-FORGOT-MAIL................................................\\

const forgotPasswordMail = async (email,name,userId)=>{
try{
    const transporter = nodemailer.createTransport({
        host:'smtp.gmail.com',
        port:465,
        secure:true,
        auth:{
            user:'filmpluswebsite@gmail.com',
            pass:EMAIL_PASS
        },

    });

    const mailOptions={
        from:'filmpluswebsite@gmail.com',
        to:email,
        subject:'Forgot Password',
        html:`<p>Hello ${name} Please click here <a href = "${FRONTENDURL}/resetPassword/${userId}">here</a>if you want't to reset your password</p>`
    };

    transporter.sendMail(mailOptions, (error,info)=>{
        if(error){
            console.log('email could not be sent',error.message);
        }else{
            console.log('email has been sent', info.response);
        }
    })

}catch (error){
console.log(error);
console.log('error occured while sending mail')
}
}

// ...................................FORGOT-PASSWORD.....................................................\\

const forgotPassword = async (req,res)=>{
    try{
        const {email} = req.body
        const user = await userModel.findOne({email})
        if(user){
            forgotPasswordMail(email,user.name,user._id)
            res.status(200).json({message:'Please check your mail'})
        }else{
            res.status(400).json({errmsg:'user not found'})
        }
        
    }catch (error){
        res.status(500).json({errmsg:'Server error'})

    }
}

// ................................RESET-PASSSWORD..................................................\\

const restPassword = async (req,res)=>{
    try{
        const {userId,password} = req.body
        await userModel.updateOne({ _id: userId},{ $set:{ password: sha256(password + SALT)}})
        res.status(200).json({message:'Password Changed'})
    }catch (error){
        res.status(500).json({errmsg:"Server error"})
    }
}



// ....................................GOOGLE-LOGIN...............................................\\

const googleLogin = async (req, res) => {
  try {
    let { profile } = req.body;
    const email = profile?.email;
    const name = profile?.name;
    const profileImage = profile?.picture;
    const user = await userModel.findOne({ email: email });
    if (!user) {
      const newUser = await userModel.create({
        email,
        name,
        profileImage,
        isVerified: true,
      });
      const token = generateToken(newUser._id, "user");
      res.status(200).json({
          message: "User login successfully",
          name: newUser.name,
          userId: newUser._id,
          token,
          role: "user",
        });
    } else if (user.isBlocked) {
      res.status(403).json({ errmsg: "user is blocked by admin" });
    } else {
        if (!user.isVerified) {
          if (!user.profileImage) {
            await userModel.updateOne({ email }, { $set: { profileImage, isVerified: true } } );
          } else {
            await userModel.updateOne( { _id: user._id },{ $set: { isVerified: true } });
          }
          const token = generateToken(user._id, "user");
          res.status(200).json({
              message: "user login successfully",
              name: user.name,
              token,
              userId: user._id,
              role: "user",
            });
        } else {
          if (!user.profileImage) {
            await userModel.updateOne({ email }, { $set: { profileImage } });
          }
          const token = generateToken(user._id, "user");
          res.status(200).json({
              message: "user login successfully",
              name: user.name,
              token,
              userId: user._id,
              role: "user",
            });
        }
      
    }
  } catch (err) {}
};


// ..................................................LOAD-PROFILE...........................................................\\

const loadProfile = async (req,res)=>{
  try{
    const userId = req.payload.id 
    const user = await userModel.findOne({_id:userId})
    return res.status(200).json({user})
  }catch (err){
    return res.status(500).json({errmsg:"Server error"})
  }
}


// ................................................EDIT-PROFILE-UPDATE............................................\\\

const editProfile = async (req, res) => {
  try {
    let { name, profileImage, phone } = req.body;
    name = name.trim();
    await userModel.updateOne({ _id: req.payload.id }, { $set: { name, profileImage, phone } });
    return res.status(200).json({ message: "Profile updated successfully" });
  } catch (err) {
    return res.status(500).json({ errmsg: "Server Error" });
  }
};


// ..................................RENT-HISTORY...........................................\\\

const rentHistory = async (req, res) => {
  try {
    const userId = req.params.userId; 
    console.log(userId + "user is");

    const rentedProducts = await RentModel.find({ userId: userId }).populate('productId');

    if (rentedProducts) {
      res.status(200).json({ rentedProducts });
    }
  } catch (err) {
    res.status(500).json({ errmsg: 'server error' });
    console.error('rentHistory:', err);
  }
}
// /.....................................CHANGE PASSWORD FROM PROFILE...................................................
const changePassword = async (req,res)=>{
  try{
    const {userId} = req.params
    const {email,rePass,newPass} = req.body
    const user = await userModel.find({$and:[{_id:userId},{email:email}]});

    if(user){
      await userModel.updateOne({ _id: userId},{ $set:{ password: sha256(newPass + SALT)}})
      res.status(200).json({message:"Password Changed Successfully"});
    }
    

  }catch (err){
     console.error("changepassword:",err)
  }
}





module.exports = {
  register,
  verifyMail,
  login,
  forgotPassword,
  restPassword,
  googleLogin,
  loadProfile,
  editProfile,
  rentHistory,
  changePassword
};
