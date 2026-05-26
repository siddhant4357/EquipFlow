const express = require('express');
const { getOverview, getActivity } = require('../controllers/dashboard.controller');
const { protect, allowRoles } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(protect, allowRoles('admin', 'manager'));

router.get('/overview', getOverview);
router.get('/activity', getActivity);

module.exports = router;
