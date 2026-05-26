const Asset = require('../models/asset.model');
const Event = require('../models/event.model');
const User = require('../models/user.model');

// @desc    Get dashboard overview stats
// @route   GET /api/dashboard/overview
// @access  Admin, Manager
const getOverview = async (req, res, next) => {
  try {
    const [totalAssets, byStatus, totalUsers, recentEvents, overdueAssetsList] = await Promise.all([
      Asset.countDocuments({}),
      Asset.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      User.countDocuments({ isActive: true }),
      Event.countDocuments({ createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }),
      Asset.find({
        nextMaintenanceDate: { $lt: new Date() },
        status: { $ne: 'maintenance' },
      }).select('assetId name category nextMaintenanceDate').limit(10),
    ]);

    const statusMap = {};
    byStatus.forEach(({ _id, count }) => { statusMap[_id] = count; });

    res.status(200).json({
      success: true,
      data: {
        totalAssets,
        active: statusMap['active'] || 0,
        inMaintenance: statusMap['maintenance'] || 0,
        inTransit: statusMap['in-transit'] || 0,
        lost: statusMap['lost'] || 0,
        retired: statusMap['retired'] || 0,
        totalUsers,
        eventsLast24h: recentEvents,
        overdueMaintenanceCount: overdueAssetsList.length,
        overdueAssets: overdueAssetsList,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recent activity feed
// @route   GET /api/dashboard/activity
// @access  Admin, Manager
const getActivity = async (req, res, next) => {
  try {
    const { limit = 20 } = req.query;
    const events = await Event.find({})
      .populate('assetId', 'assetId name category')
      .populate('operatorId', 'name role')
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.status(200).json({ success: true, data: events });
  } catch (error) {
    next(error);
  }
};

module.exports = { getOverview, getActivity };
