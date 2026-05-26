const express = require('express');
const {
  getAssets, getAsset, createAsset, updateAsset, deleteAsset, regenerateQR,
} = require('../controllers/asset.controller');
const { getAssetHistory } = require('../controllers/sync.controller');
const { protect, allowRoles } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(protect); // All asset routes require authentication

router.get('/', getAssets);
router.get('/:id', getAsset);
router.get('/:id/history', allowRoles('admin', 'manager'), getAssetHistory);
router.post('/', allowRoles('admin', 'manager'), createAsset);
router.post('/:id/qr', allowRoles('admin', 'manager'), regenerateQR);
router.put('/:id', allowRoles('admin', 'manager'), updateAsset);
router.delete('/:id', allowRoles('admin'), deleteAsset);

module.exports = router;
