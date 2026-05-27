const aiService = require('../services/ai.service');

/**
 * @desc    Trigger AI predictions for all assets
 * @route   POST /api/dashboard/run-predictions
 * @access  Private (Admin/Manager)
 */
exports.runPredictions = async (req, res, next) => {
  try {
    const result = await aiService.runPredictionsForAll();
    res.status(200).json({
      success: true,
      message: 'AI predictions completed successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Trigger AI model training
 * @route   POST /api/dashboard/train-ai
 * @access  Private (Admin)
 */
exports.trainModel = async (req, res, next) => {
  try {
    const result = await aiService.triggerTraining();
    res.status(200).json({
      success: true,
      message: 'AI model training completed',
      data: result
    });
  } catch (error) {
    next(error);
  }
};
