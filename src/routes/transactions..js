const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/transactionsController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/',             ctrl.getMyTransactions);
router.get('/dividends',    ctrl.getMyDividends);
router.get('/:id',          ctrl.getOne);
router.post('/deposit',     ctrl.deposit);
router.post('/withdraw',    ctrl.withdraw);

module.exports = router;
