import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { assetService } from '../../services/dataService';

// Fix for default leaflet marker icon in react
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const customIcon = new L.Icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

import { useMap } from 'react-leaflet';

const MapController = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 16);
  }, [center, map]);
  return null;
};

const MapOverview = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [mapCenter, setMapCenter] = useState(null);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const { data } = await assetService.getAll({ limit: 1000 });
        setAssets(data.filter(a => a.location?.lat && a.location?.lng));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchAssets();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchInput) return;

    // Check if input is coordinates (e.g., "40.7128, -74.0060")
    const coordMatch = searchInput.match(/^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lng = parseFloat(coordMatch[3]);
      setMapCenter([lat, lng]);
      return;
    }

    // Otherwise, search for asset name or ID
    const foundAsset = assets.find(a => 
      a.name.toLowerCase().includes(searchInput.toLowerCase()) || 
      a.assetId.toLowerCase().includes(searchInput.toLowerCase())
    );
    
    if (foundAsset) {
      setMapCenter([foundAsset.location.lat, foundAsset.location.lng]);
    } else {
      alert('Coordinates format should be "lat, lng" or enter a valid asset name.');
    }
  };

  const defaultCenter = [40.7128, -74.0060]; // NYC as fallback

  if (loading) return <div className="spinner" style={{ margin: '40px auto', width: '32px', height: '32px', border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%' }} />;

  const initialCenter = assets.length > 0 ? [assets[0].location.lat, assets[0].location.lng] : defaultCenter;

  return (
    <div className="fade-in card" style={{ padding: '0', overflow: 'hidden', height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      
      <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', flex: 1, maxWidth: '600px' }}>
          <div className="search-bar" style={{ flex: 1, margin: 0 }}>
            <span>🗺️</span>
            <input 
              type="text" 
              placeholder="Search by coordinates (lat, lng) or asset name..." 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary">Find Location</button>
        </form>
      </div>

      <div style={{ flex: 1 }}>
        <MapContainer center={initialCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
          {mapCenter && <MapController center={mapCenter} />}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
        {assets.map((asset) => (
          <Marker 
            key={asset._id} 
            position={[asset.location.lat, asset.location.lng]}
            icon={asset.status === 'lost' ? new L.Icon({
              ...customIcon.options,
              iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png'
            }) : customIcon}
          >
            <Popup>
              <div style={{ padding: '4px' }}>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 'bold' }}>{asset.name}</h4>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>ID: {asset.assetId}</div>
                <div className={`badge badge-${asset.status}`} style={{ display: 'inline-block' }}>{asset.status}</div>
                <div style={{ marginTop: '8px', fontSize: '11px', color: '#888' }}>
                  {asset.location?.address || 'GPS Coordinates only'}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      </div>
    </div>
  );
};

export default MapOverview;
