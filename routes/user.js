const express = require('express');
const router = express.Router();
const userController = require('../controller/userController/user_main_Controller');
const productController = require('../controller/userController/rent_product_controller');
const paymentController = require('../controller/userController/rent_payment_controller');
const movieController = require('../controller/userController/movie_controller');
const communityController = require('../controller/userController/community_controller');
const providerController = require('../controller/userController/provider_chat');
const auth = require('../middleware/auth');

router.post('/register',userController.register);
router.get('/verifyMail/:userId',userController.verifyMail);
router.post('/login',userController.login);
router.post('/googleLogin',userController.googleLogin);
router.post('/forgotPassword',userController.forgotPassword);
router.post('/resetPassword',userController.restPassword);
router.get('/userProfile',auth.verifyUserToken,userController.loadProfile);
router.patch('/editProfile',auth.verifyUserToken,userController.editProfile);
router.patch('/changepassword/:userId',auth.verifyUserToken,userController.changePassword);
router.post('/addtofavorite',auth.verifyUserToken,movieController.addToFavorite);
router.get('/getfavorites/:userId',auth.verifyUserToken,movieController.getFavoriteMovies);
router.patch('/deleteFavorites',auth.verifyUserToken,movieController.deleteFavorite);
router.post('/addReview',auth.verifyUserToken,movieController.addReview);
router.get('/getReviews/:movieId',auth.verifyUserToken,movieController.getReviews);
router.put('/addproduct',auth.verifyUserToken,productController.addProduct);
router.get('/getproducts',auth.verifyUserToken,productController.getProducts);
router.get('/product/:id', auth.verifyUserToken, productController.product);
router.get('/productlists/:userId',productController.productsLists);
router.patch('/liststatus/:productId',auth.verifyUserToken,productController.unlistProduct);
router.patch('/editproduct',productController.updateProduct);
router.post('/create-checkout-session',auth.verifyUserToken,paymentController.createCheckoute);
router.get('/paymentSuccess',paymentController.paymentSuccess)
router.get('/paymentFail',paymentController.paymentFail);
router.get('/renthistory/:userId',auth.verifyUserToken,userController.rentHistory);
router.get('/popularmovies',movieController.listPopularMovies);
router.get('/topratedmovies',movieController.listTopRatedMovies);
router.get('/singlemovie/:movieId',movieController.singleMovie);
router.get('/averagerating/:movieId',movieController.calculateAverageRatingForMovie);
router.get('/getmovies',movieController.getMovies);
router.get('/providerlist/:providerId',auth.verifyUserToken,productController.productOnRental);
router.patch('/returned/:rentalId',auth.verifyUserToken,productController.returned);
router.post('/rentonduemail',auth.verifyUserToken,productController.rentReturnMail);
router.get('/userInfo/:userId',auth.verifyUserToken,communityController.userInfo);
router.get('/allusers/:userId',auth.verifyUserToken,communityController.allUsers)
router.post('/oneOnOne/:userId',auth.verifyUserToken,communityController.accessChat);
router.get('/fetchChats/:userId',auth.verifyUserToken,communityController.fetchChats);
router.post('/addcommunity/:userId',auth.verifyUserToken,communityController.createCommunity);
router.patch('/editcommunity',auth.verifyUserToken,communityController.editCommunity);
router.patch('/addtogroup',auth.verifyUserToken,communityController.addToCommunity);
router.patch('/removefromcommunity',auth.verifyUserToken,communityController.removeFromCommunity);
router.get('/providerInfo/:providerId',auth.verifyUserToken,providerController.providerInfo);
router.get('/providerChat/:providerId',auth.verifyUserToken,providerController.accessChat);
router.get('/chatslist/:userId',auth.verifyUserToken,providerController.fetchChats);
router.post('/addmessage',auth.verifyUserToken,providerController.addMessage);

module.exports = router