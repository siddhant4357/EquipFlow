/**
 * Reverse geocode lat/lng to a human-readable address using OpenStreetMap Nominatim (free, no API key)
 * @param {number} lat
 * @param {number} lng
 * @returns {Promise<string>} address string
 */
const reverseGeocode = async (lat, lng) => {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'EquipFlow/1.0' },
    });
    if (!response.ok) return 'Unknown Location';
    const data = await response.json();
    return data.display_name || 'Unknown Location';
  } catch {
    return 'Unknown Location';
  }
};

module.exports = { reverseGeocode };
