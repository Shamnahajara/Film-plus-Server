const RentProductModel = require('../../models/productModel')
const UserModel = require('../../models/userModel')
const RentModel = require('../../models/rentModel')
const nodemailer = require('nodemailer')
const EMAIL_PASS = process.env.EMAIL_PASS


// .................................ADD-RENT-PRODUCT...........................................
const addProduct = async (req,res)=>{
  try{
   const {userId,location,latitude,longitude,images,description,productName,price} = req.body
   await RentProductModel.create({
      providerId:userId,
      productName:productName,
      description:description,
      productImage:images,
      rentPrice:price,
      locationName:location,
      longitude:longitude,
      latitude:latitude })
    return res.status(200).json({message:'product added successfully'});
  }catch (err){
    res.status(500).json({errmsg:'Server Error'})
    console.error('AddProduct : ',err)
  }
}

// ..................................GET-PRODUCTS-LIST.......................................
const getProducts = async (req,res)=>{
  try{
    const products= await RentProductModel.find({})
    if(products){
      res.status(200).json({products})
    }

  }catch (err){
    res.status(500).json({errmsg:'Server Error'});
    console.error('getProducts :',err)
  }
}


// .................................GET-SINGLE-PRODUCT......................................

const product = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await RentProductModel.findById({ _id: id }).populate('providerId');

    if (product) {
      res.status(200).json({ product });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (err) {
    console.error('Product: ', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};


// ................................PROVIDER-PRODUCT-LIST........................................

const productsLists = async (req, res) => {
  try {

    const { userId } = req.params; 

    const products = await RentProductModel.find({ providerId: userId }).exec(); 
    if (products) {
      res.status(200).json({ products });
    } else {
      res.status(403).json({ errmsg: 'There are no products' });
    }
  } catch (err) {
    res.status(500).json({ errmsg: 'Server Error' });
    console.error('productsLists:', err);
  }
}


// .................................PROVIDER-UNLIST-PRODUCT.................................
const unlistProduct = async (req,res)=>{
  try{
    const {productId} = req.params
    const {unlisted} = req.body
    if(unlisted){
      await RentProductModel.findOneAndUpdate({_id:productId},{$set:{isUnlisted:false}})
      res.status(200).json({message:'product listed successfully'})
    }else{
      await  RentProductModel.findOneAndUpdate({_id:productId},{$set:{isUnlisted:true}})
      res.status(200).json({message:'Product unlisted successfully'})
    }
  }catch (err){
    res.status(500).json({errmsg:'Server error'})
    console.error('unlistProduct :',err)
  }
}


// ..............................PROVIDER-UPDATE-PRODUCT....................................
const updateProduct = async (req, res) => {
  try {
    const {
      productId ,
      location,
      latitude,
      longitude,
      images,
      description,
      productName,
      price,
    } = req.body;

    console.log('product Id :',productId)

    const updatedProduct = await RentProductModel.findByIdAndUpdate({_id:productId}
      ,
      {$set:  {
        locationName: location,
        latitude: latitude,
        longitude: longitude,
        productImage: images,
        description: description,
        productName: productName,
        rentPrice: price,
      }}
    ,
      { new: true } 
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.status(200).json({ message: 'Product updated successfully' });
  } catch (err) {
    console.error('Update Product: ', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ...........................................provider product on rental...........................................
const productOnRental = async (req, res) => {
  try {
    const providerId = req.params.providerId;

    const products = await RentProductModel.find({ providerId });

    const productIds = products.map(product => product._id);

    const rentals = await RentModel.find({ 'productId': { $in: productIds } })
      .populate('userId productId');

    if (rentals.length > 0) {
      res.status(200).json({ rentals: rentals });
    } else {
      res.status(404).json({ message: 'No matching rentals found.' });
    }
  } catch (err) {
    console.error('productOnRental', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// ......................................provider clicking return button.............................................
const returned = async (req,res)=>{
  try{
    const {rentalId} = req.params
    const {productId} = req.body
    console.log ("rentalId:",req.params)
    console.log("ProductId :",req.body)

    const isReturned  = await RentModel.findByIdAndUpdate({_id:rentalId},{$set :{
      returned : true
    }})
    if(isReturned){
      await RentProductModel.findByIdAndUpdate({_id:productId._id},{$set:{isRented:false}})
    }
    res.status(200).json({message:"Status updated"});

  }catch (err){
    console.error()
  }
}

//.....................................PROVIDER SENDING MAIL TO THE RENTERD USER.................................................
const rentOnDueMail = async (Email,Name,ProductName,FromDate,ToDate)=>{
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
          to:Email,
          subject:'Rented product is on due',
          html:`<html>
          <body>
              <p>Dear ${Name},</p>
              <p>We hope this email finds you well. We are writing to remind you about the return of the film production equipment from Film plus Productions. It appears that the rental period for the equipment you currently have is nearing its end.</p>
              <p>We kindly request that you return the equipment to our rental facility at your earliest convenience. Returning the equipment on time ensures that it remains available for other customers and helps us maintain an efficient rental service.</p>
              <h3>Please take note of the following details:</h3>
              <h4>Rental Information:</h4>
              <p>Equipment Name: ${ProductName}</p>
              <p>Rental Start Date: ${FromDate}</p>
              <p>Rental End Date: ${ToDate}</p>
              <h4>Return Address:</h4>
              <p>Film Plus Productions</p>
              <p>123 Film Street</p>
              <p>Hollywood, CA 90001</p>
      
              <h2>Return Instructions:</h2>
      
              <p>Ensure that the equipment is in good condition, free from any damage or excessive wear and tear.
              Gather any rented accessories or additional items that were provided with the equipment.
              Pack the equipment securely for transportation, considering the safety of the equipment and others during transit.
              Visit our rental facility during our business hours to return the equipment.
              Our staff will assist you with the return process, including the completion of any necessary paperwork.
              Please be aware that failing to return the equipment by the specified return date may result in additional rental charges and the loss of future rental privileges. We kindly ask for your prompt attention to avoid any inconvenience.
      
              If you have any questions or need further assistance, please feel free to contact our customer support team at 2451367899 or via email  at  filmpluswebsite@gmail.com . We will be more than happy to assist you.
      
              Thank you for choosing Film Plus Productions for your film production equipment needs. We appreciate your cooperation and look forward to receiving the rented equipment back soon.
      
              Best regards,</p>
              <p>
              Film Plus Productions</p>
          </body>
      </html>`
      
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


//.......................................RENT-PRODUCT RETURN MAIL FROM PROVIDER..........................................

const rentReturnMail = async (req, res) => {
  try {
    const { rentalId, productId } = req.body;

    const rentData = await RentModel.findById(rentalId).populate('userId');
    const user = rentData.userId;
    const Email= user.email
    const Name =  user.name

    const product = await RentProductModel.findById(productId);
    const ProductName = product.productName
    const FromDate = new Date (rentData.fromDate).toLocaleDateString()
    const ToDate = new Date (rentData.toDate) .toLocaleDateString()

    rentOnDueMail(Email,Name,ProductName,FromDate,ToDate)
    res.status(200).json({ message: 'Mail sent successfully' });
  } catch (err) {
    console.error('rentReturnMail:', err);
    res.status(500).json({ errmsg: 'Failed to send mail' });
  }
};

module.exports = rentReturnMail;






module.exports = {
    addProduct,
    getProducts,
    product,
    productsLists,
    unlistProduct,
    updateProduct,
    productOnRental,
    returned,
    rentReturnMail
}