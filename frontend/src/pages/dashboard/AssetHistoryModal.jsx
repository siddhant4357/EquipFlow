import { useState, useEffect } from 'react';
import { assetService } from '../../services/dataService';

const AssetHistoryModal = ({ asset, onClose }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await assetService.getHistory(asset._id);
        setHistory(data.data || []);
      } catch (error) {
        console.error('Failed to fetch history', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [asset._id]);

  const getEventIcon = (type) => {
    switch(type) {
      case 'scan': return '📍';
      case 'maintenance': return '🔧';
      case 'in-transit': return '🚚';
      case 'active': return '✅';
      case 'lost': return '🚨';
      default: return 'ℹ️';
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: '600px', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 className="modal-title" style={{ marginBottom: '4px' }}>Asset Audit Trail</h3>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{asset.name} ({asset.assetId})</div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>Close</button>
        </div>

        <div style={{ overflowY: 'auto', flex: 1, paddingRight: '8px' }}>
          {loading ? (
             <div className="spinner" style={{ margin: '40px auto', width: '32px', height: '32px', border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%' }} />
          ) : history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>📭</div>
              <p>No activity recorded for this asset yet.</p>
            </div>
          ) : (
            <div className="timeline">
              {history.map((event, index) => (
                <div key={event._id} style={{ display: 'flex', gap: '16px', marginBottom: '24px', position: 'relative' }}>
                  {/* Vertical Line */}
                  {index !== history.length - 1 && (
                    <div style={{ position: 'absolute', left: '15px', top: '32px', bottom: '-24px', width: '2px', background: 'var(--border)' }}></div>
                  )}
                  
                  {/* Icon */}
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, border: '2px solid var(--bg-primary)' }}>
                    {getEventIcon(event.eventType)}
                  </div>
                  
                  {/* Content */}
                  <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '12px', flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ fontWeight: '600', textTransform: 'capitalize' }}>Marked as {event.eventType}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {new Date(event.clientTimestamp || event.createdAt).toLocaleString()}
                      </div>
                    </div>
                    
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      By <span style={{ fontWeight: '500', color: 'var(--accent)' }}>{event.operatorId?.name || 'Unknown User'}</span>
                    </div>

                    {event.location?.address && (
                      <div style={{ fontSize: '12px', display: 'flex', gap: '6px', alignItems: 'flex-start', background: 'var(--bg-primary)', padding: '8px', borderRadius: '6px' }}>
                        <span>🗺️</span> 
                        <span>{event.location.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssetHistoryModal;
