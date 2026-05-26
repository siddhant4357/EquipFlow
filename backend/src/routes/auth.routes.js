const express = require('express');
const { register, login, refresh, getMe } = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.get('/me', protect, getMe);

module.exports = router;
