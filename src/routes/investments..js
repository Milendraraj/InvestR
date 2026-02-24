const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/investmentsController');
const { authenticate, kycRequired } = require('../middleware/auth');

// All investment routes require auth
router.use(authenticate);

router.post('/',          kycRequired, ctrl.invest);
router.get('/my',                      ctrl.getMyInvestments);
router.post('/:id/sell',  kycRequired, ctrl.sell);

module.exports = router;
