const Asset = require('../models/asset.model');
const { generateQRCode } = require('../utils/qrcode.util');

// @desc    Get all assets (with pagination, search, filter)
// @route   GET /api/assets
// @access  Admin, Manager, Operator
const getAssets = async (req, res, next) => {
  try {
    const { status, category, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { assetId: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Operators only see all assets (for scanning lookup) — no restriction needed
    const total = await Asset.countDocuments(query);
    const assets = await Asset.find(query)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: assets,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single asset by ID or assetCode
// @route   GET /api/assets/:id
// @access  Protected
const getAsset = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Support lookup by MongoDB _id OR assetId code
    const asset = await Asset.findOne({
      $or: [{ _id: id.match(/^[a-f\d]{24}$/i) ? id : null }, { assetId: id }],
    })
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name');

    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }
    res.status(200).json({ success: true, data: asset });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new asset + generate QR code
// @route   POST /api/assets
// @access  Admin, Manager
const createAsset = async (req, res, next) => {
  try {
    const { name, category, description, assignedTo, tags, nextMaintenanceDate } = req.body;
    // Create without qrCode first to get the assetId
    const asset = await Asset.create({
      name,
      category,
      description,
      assignedTo: assignedTo || null,
      tags,
      nextMaintenanceDate,
      createdBy: req.user._id,
    });
    // Generate QR code with the assetId
    const qrCode = await generateQRCode(asset.assetId);
    asset.qrCode = qrCode;
    await asset.save();

    res.status(201).json({ success: true, data: asset });
  } catch (error) {
    next(error);
  }
};

// @desc    Update asset
// @route   PUT /api/assets/:id
// @access  Admin, Manager
const updateAsset = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'category', 'description', 'status', 'assignedTo', 'location', 'tags', 'nextMaintenanceDate'];
    const updates = {};
    allowedFields.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    const asset = await Asset.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).populate('assignedTo', 'name email');

    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });
    res.status(200).json({ success: true, data: asset });
  } catch (error) {
    next(error);
  }
};

// @desc    Soft delete asset
// @route   DELETE /api/assets/:id
// @access  Admin only
const deleteAsset = async (req, res, next) => {
  try {
    const asset = await Asset.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });
    res.status(200).json({ success: true, message: 'Asset deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Regenerate QR code for an asset
// @route   POST /api/assets/:id/qr
// @access  Admin, Manager
const regenerateQR = async (req, res, next) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });
    asset.qrCode = await generateQRCode(asset.assetId);
    await asset.save();
    res.status(200).json({ success: true, qrCode: asset.qrCode, assetId: asset.assetId });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAssets, getAsset, createAsset, updateAsset, deleteAsset, regenerateQR };
