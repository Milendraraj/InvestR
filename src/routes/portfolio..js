const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/portfolioController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/',                              ctrl.getPortfolio);
router.get('/performance',                   ctrl.getPerformance);
router.get('/wishlist',                      ctrl.getWishlist);
router.post('/wishlist/:propertyId',         ctrl.addToWishlist);
router.delete('/wishlist/:propertyId',       ctrl.removeFromWishlist);

module.exports = router;
