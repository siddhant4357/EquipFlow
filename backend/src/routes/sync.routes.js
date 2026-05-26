const express = require('express');
const { pushEvents, pullAssets } = require('../controllers/sync.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(protect);

router.get('/assets', pullAssets);
router.post('/events', pushEvents);

module.exports = router;
