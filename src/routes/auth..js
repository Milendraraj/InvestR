const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const ctrl = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// Validation rules
const registerRules = [
  body('fullName').trim().notEmpty().withMessage('Full name is required.').isLength({ max: 120 }),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required.'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.'),
];

const loginRules = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required.'),
  body('password').notEmpty().withMessage('Password is required.'),
];

router.post('/register',         registerRules, ctrl.register);
router.post('/login',            loginRules,    ctrl.login);
router.get('/me',                authenticate,  ctrl.getMe);
router.patch('/me',              authenticate,  ctrl.updateMe);
router.post('/change-password',  authenticate,  ctrl.changePassword);

module.exports = router;
