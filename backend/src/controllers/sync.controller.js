const Event = require('../models/event.model');
const Asset = require('../models/asset.model');

// Map eventType to new asset status
const eventToStatus = {
  maintenance: 'maintenance',
  'in-transit': 'in-transit',
  found: 'active',
  lost: 'lost',
  active: 'active',
  scan: null, // scan doesn't change status
};

// @desc    Bulk push events from operator device (offline sync)
// @route   POST /api/sync/events
// @access  Protected (all roles)
const pushEvents = async (req, res, next) => {
  try {
    const { events } = req.body; // array of event objects
    if (!Array.isArray(events) || events.length === 0) {
      return res.status(400).json({ success: false, message: 'Events array is required' });
    }

    const results = [];
    const errors = [];

    for (const ev of events) {
      try {
        // Lookup asset by assetId code
        const asset = await Asset.findOne({ assetId: ev.assetCode });
        if (!asset) {
          errors.push({ assetCode: ev.assetCode, error: 'Asset not found' });
          continue;
        }

        // Create the event
        const event = await Event.create({
          assetId: asset._id,
          assetCode: ev.assetCode,
          operatorId: req.user._id,
          eventType: ev.eventType,
          location: ev.location || {},
          notes: ev.notes || '',
          synced: true,
          clientTimestamp: ev.clientTimestamp || new Date(),
        });

        // Event sourcing: update asset status and location based on event
        const newStatus = eventToStatus[ev.eventType];
        const updateData = {};
        if (newStatus) updateData.status = newStatus;
        if (ev.location && (ev.location.lat || ev.location.address)) {
          updateData.location = ev.location;
        }
        if (Object.keys(updateData).length > 0) {
          await Asset.findByIdAndUpdate(asset._id, updateData);
        }

        results.push({ assetCode: ev.assetCode, eventId: event._id, status: 'synced' });
      } catch (err) {
        errors.push({ assetCode: ev.assetCode, error: err.message });
      }
    }

    res.status(200).json({
      success: true,
      synced: results.length,
      failed: errors.length,
      results,
      errors,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Pull all assets (lightweight) for operator local DB
// @route   GET /api/sync/assets
// @access  Protected (all roles)
const pullAssets = async (req, res, next) => {
  try {
    const assets = await Asset.find({})
      .select('assetId name category status location assignedTo')
      .populate('assignedTo', 'name')
      .lean();

    res.status(200).json({ success: true, count: assets.length, data: assets });
  } catch (error) {
    next(error);
  }
};

// @desc    Get full event history for a specific asset
// @route   GET /api/assets/:id/history
// @access  Admin, Manager
const getAssetHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const asset = await Asset.findOne({
      $or: [{ _id: id.match(/^[a-f\d]{24}$/i) ? id : null }, { assetId: id }],
    });
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });

    const history = await Event.find({ assetId: asset._id })
      .populate('operatorId', 'name email role')
      .sort({ clientTimestamp: -1 })
      .limit(100);

    res.status(200).json({ success: true, count: history.length, data: history });
  } catch (error) {
    next(error);
  }
};

module.exports = { pushEvents, pullAssets, getAssetHistory };
