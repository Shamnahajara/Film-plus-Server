const express = require('express')
const router = express.Router()
const mainController = require('../controller/adminController/mainController')
const userController = require('../controller/adminController/userController')
const productController = require('../controller/adminController/productController')
const movieController = require('../controller/adminController/movieController')
const communityController = require('../controller/adminController/communityController')
const auth = require('../middleware/auth')

router.post('/login', mainController.adminLogin);
router.get('/users', auth.verifyAdminToken, userController.users);
router.patch('/userStatus', auth.verifyAdminToken, userController.userStatus);
router.get('/rentproducts', auth.verifyAdminToken, productController.getProducts);
router.patch('/productStatus/:productId', auth.verifyAdminToken, productController.unlistProduct);
router.post('/addmovie', auth.verifyAdminToken, movieController.addMovie);
router.get('/movies', auth.verifyAdminToken, movieController.getMovies);
router.patch('/unlistmovie/:movieId', auth.verifyAdminToken, movieController.unlistMovie);
router.get('/communities', auth.verifyAdminToken, communityController.communities);
router.patch('/communitystatus', auth.verifyAdminToken, communityController.communityStatus);
router.get('/carddata', auth.verifyAdminToken, mainController.cardData);
router.get('/recentmovies', auth.verifyAdminToken, mainController.latestMovies);

module.exports = router