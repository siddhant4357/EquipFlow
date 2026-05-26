const QRCode = require('qrcode');

/**
 * Generate a QR code as a base64 PNG data URL for a given assetId
 * @param {string} assetId - The unique asset identifier (e.g. AC-XXXXXXXX)
 * @returns {Promise<string>} base64 PNG data URL
 */
const generateQRCode = async (assetId) => {
  try {
    const dataUrl = await QRCode.toDataURL(assetId, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 400,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });
    return dataUrl;
  } catch (error) {
    throw new Error(`QR Code generation failed: ${error.message}`);
  }
};

module.exports = { generateQRCode };
