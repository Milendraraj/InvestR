const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/listingsController');
const { authenticate, adminOnly } = require('../middleware/auth');

// Anyone logged-in can submit; admin can manage
router.post('/',              authenticate, ctrl.submitListing);
router.get('/my',             authenticate, ctrl.getMyListings);
router.get('/',               authenticate, adminOnly, ctrl.getAllListings);
router.patch('/:id/status',   authenticate, adminOnly, ctrl.updateListingStatus);

module.exports = router;
