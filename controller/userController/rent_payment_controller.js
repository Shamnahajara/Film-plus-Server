const RentModel = require('../../models/rentModel');
const ProductModel =require('../../models/productModel');
const Stripe = require('stripe')
const STRIPE_API_KEY = process.env.STRIPE_API_KEY
console.log('here',STRIPE_API_KEY)
const stripe = Stripe(STRIPE_API_KEY);
const FRONTEND_URL = process.env.FRONTEND_URL
const BACKEND_URL = process.env.BACKEND_URL

// ................................CHECKOUT-AND-PAYMENT...................................
const createCheckoute = async (req, res) => {
  try {
    console.log('here i am')
    const UserId = req.body.userId
    const fromDate = req.body.rentFrom
    const toDate = req.body.rentTo
    const location = req.body.location
    const Product = await ProductModel.findOne({_id:req.body.productId})
    
    const diff = new Date(toDate) - new Date(fromDate)
    
// .........Price increase no of days
    const difference = diff / (1000 * 3600 * 24)
    const amount = Product.rentPrice * difference

// ......checking product rented or not
    const existingBooking = await RentModel.findOne({
      productId: Product._id,
      $or: [
        {
          fromDate: { $lte: fromDate },
          toDate: { $gte: fromDate }
        },
        {
          fromDate: { $lte: toDate },
          toDate: { $gte: toDate }
        }
    ]
});


if (existingBooking) {
      res.status(409).json({ errMsg: 'This date is already booked.' });
      return;
    } else {
      const user = await stripe.customers.create({
        metadata: {
          userId: UserId,
          productId: Product._id,
          fromDate: fromDate,
          toDate: toDate,
          amount: amount,
          location:location
        }
      })

      const session = await stripe.checkout.sessions.create({
        customer: user.id,
        line_items: [
          {
            price_data: {
              currency: 'inr',
              product_data: {
                name: Product.productName,
                metadata: {
                  id: Product._id
                }
              },
              unit_amount: amount * 100,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${BACKEND_URL}/user/paymentSuccess?userId=${UserId}&productId=${Product._id}&amount=${amount}&fromDate=${fromDate}&toDate=${toDate}&location=${location}`,
        cancel_url: `${BACKEND_URL}/paymentFail`,
      })

      res.send({ url: session.url });
    }
  } catch (error) {
    res.status(500).json({ errMsg: "Server Error" })
    console.log(error)
  }
}

// ..................................PAYMENT-SUCCESS..........................................
const paymentSuccess = async (req, res) => {
    try {
        const { productId, fromDate, toDate, amount, userId,location } = req.query
        console.log(req.query+"entheeelum")
        const load = true
        await RentModel.create({
            userId: userId,
            productId: productId,
            fromDate: fromDate,
            toDate: toDate,
            amount: amount,
            bookedAt: new Date(),
            deliveryLocation: location
        })

        await ProductModel.updateOne({ _id:productId  }, { $set: { isRented: true } })

        res.redirect(`${FRONTEND_URL}/paymentSuccess/${load}`)
    } catch (error) {
        res.status(500).json({ errMsg: 'Server Error' })
        console.log(error);
    }
}

//  .....................................PAYMENT-FAIL........................................../

const paymentFail = async (req, res) => {
    try {
        res.redirect(`${FRONTEND_URL}/paymentFail`)
    } catch (error) {
        res.status(500).json({ errMsg: 'Server Error' })
        console.log(error);
    }
}





module.exports = {
    createCheckoute,
    paymentSuccess,
    paymentFail
}