import { useState, useEffect } from 'react';
import { useSync } from '../../../context/SyncContext';

const SyncQueueModal = ({ onClose }) => {
  const { fetchPendingEvents, removeEvent } = useSync();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const data = await fetchPendingEvents();
      setEvents(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleDelete = async (localId) => {
    if (window.confirm('Are you sure you want to remove this scan from the queue?')) {
      await removeEvent(localId);
      loadEvents();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: '500px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 className="modal-title" style={{ margin: 0 }}>Pending Sync Queue</h3>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>Close</button>
        </div>

        <div style={{ overflowY: 'auto', flex: 1, paddingRight: '8px' }}>
          {loading ? (
            <div className="spinner" style={{ margin: '20px auto', width: '24px', height: '24px', border: '2px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%' }} />
          ) : events.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>☁️</div>
              <p>No pending events. You are fully synced!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {events.map((ev) => (
                <div key={ev.localId} style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: '600', color: 'var(--accent)' }}>{ev.assetCode}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      <span className="badge badge-active" style={{ marginRight: '8px' }}>{ev.eventType}</span>
                      {new Date(ev.clientTimestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  <button 
                    className="btn btn-danger btn-sm" 
                    onClick={() => handleDelete(ev.localId)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SyncQueueModal;
