const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const ctrl = require('../controllers/propertiesController');
const { authenticate, adminOnly } = require('../middleware/auth');

const createRules = [
  body('name').trim().notEmpty().withMessage('Property name is required.'),
  body('location').trim().notEmpty().withMessage('Location is required.'),
  body('category').isIn(['commercial','residential','industrial']).withMessage('Invalid category.'),
  body('totalValue').isNumeric().withMessage('Total value must be a number.'),
  body('minInvestment').isNumeric().withMessage('Min investment must be a number.'),
  body('targetRoi').isNumeric().withMessage('Target ROI must be a number.'),
];

// Public
router.get('/',    ctrl.getAll);
router.get('/:id', ctrl.getOne);

// Admin only
router.post('/',       authenticate, adminOnly, createRules, ctrl.create);
router.patch('/:id',   authenticate, adminOnly, ctrl.update);
router.delete('/:id',  authenticate, adminOnly, ctrl.remove);

module.exports = router;
