const Asset = require('../models/asset.model');
const Event = require('../models/event.model');
const axios = require('axios');

const AI_SERVICE_URL = 'http://127.0.0.1:8001';

class AIService {
  /**
   * Aggregates features for a single asset based on its historical events.
   */
  async getAssetFeatures(asset) {
    const events = await Event.find({ assetId: asset._id }).sort({ clientTimestamp: 1 });

    const now = new Date();
    const createdAt = asset.createdAt || now;
    const age_days = Math.max(0, (now - createdAt) / (1000 * 60 * 60 * 24));

    let total_scans = 0;
    let maintenance_count = 0;
    let transit_count = 0;
    let last_maintenance_date = createdAt;

    events.forEach((event) => {
      if (event.eventType === 'scan') {
        total_scans++;
      } else if (event.eventType === 'maintenance') {
        maintenance_count++;
        last_maintenance_date = event.clientTimestamp;
      } else if (event.eventType === 'in-transit') {
        transit_count++;
      }
    });

    const days_since_last_maintenance = Math.max(0, (now - last_maintenance_date) / (1000 * 60 * 60 * 24));

    return {
      assetId: asset._id.toString(),
      age_days,
      total_scans,
      maintenance_count,
      transit_count,
      days_since_last_maintenance
    };
  }

  /**
   * Runs AI predictions on all non-retired, non-deleted assets.
   */
  async runPredictionsForAll() {
    const assets = await Asset.find({ status: { $ne: 'retired' } });
    let successCount = 0;
    let errorCount = 0;

    for (const asset of assets) {
      try {
        const features = await this.getAssetFeatures(asset);
        
        // Call Python AI Microservice
        const response = await axios.post(`${AI_SERVICE_URL}/predict`, features);
        
        if (response.data && response.data.risk_probability !== undefined) {
          asset.aiFailureRisk = response.data.risk_probability;
          await asset.save();
          successCount++;
        }
      } catch (error) {
        console.error(`Failed to get prediction for asset ${asset._id}:`, error.message);
        errorCount++;
      }
    }

    return {
      totalProcessed: assets.length,
      successCount,
      errorCount
    };
  }

  /**
   * Triggers the AI service to train its model.
   */
  async triggerTraining() {
    try {
      const response = await axios.post(`${AI_SERVICE_URL}/train`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to trigger training: ${error.message}`);
    }
  }
}

module.exports = new AIService();
