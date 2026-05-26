import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSync } from '../../context/SyncContext';
import { findAssetById } from '../../services/syncDb';
import { useGeolocation } from '../../hooks/useGeolocation';
import QRScanner from '../../components/scanner/QRScanner';
import SyncQueueModal from './components/SyncQueueModal';

// view: 'idle' | 'scanning' | 'result'
const OperatorDashboard = () => {
  const { logout } = useAuth();
  const { isOnline, pendingCount, pullAssets, pushEvents, addEvent } = useSync();
  const { location } = useGeolocation();

  const [view, setView] = useState('idle');
  const [scannedAsset, setScannedAsset] = useState(null);
  const [scannedCode, setScannedCode] = useState('');
  const [toast, setToast] = useState('');
  const [showQueue, setShowQueue] = useState(false);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const goIdle = () => {
    setView('idle');
    setScannedCode('');
    setScannedAsset(null);
  };

  const handleScan = async (decodedText) => {
    setScannedCode(decodedText);
    const asset = await findAssetById(decodedText);
    setScannedAsset(asset || null);
    setView('result'); // switch view AFTER data is ready
  };

  const logEvent = async (eventType) => {
    const event = {
      assetCode: scannedCode,
      eventType,
      location: location || { address: 'Unknown' },
      notes: '',
    };
    await addEvent(event);
    goIdle();
    showToast(`✅ Logged: ${eventType}`);
  };

  return (
    <div style={{ padding: '20px', paddingBottom: '80px', maxWidth: '600px', margin: '0 auto', minHeight: '100vh', background: 'var(--bg-primary)' }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
          background: 'var(--bg-card)', border: '1px solid rgba(6,214,160,0.4)',
          color: 'var(--success)', padding: '12px 24px', borderRadius: '999px',
          fontWeight: '600', fontSize: '14px', zIndex: 9999,
          boxShadow: '0 4px 24px rgba(0,0,0,0.5)', animation: 'slideUp 0.3s ease',
          whiteSpace: 'nowrap',
        }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="logo-icon" style={{ width: '32px', height: '32px', fontSize: '16px' }}>⚡</div>
          <h2 style={{ fontSize: '18px', fontWeight: '700' }}>Operator Mode</h2>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div className={`sync-indicator ${isOnline ? 'online' : 'offline'}`}>
            <div className={`sync-dot ${isOnline ? 'online' : 'offline'}`} />
            {pendingCount > 0 && <span style={{ marginLeft: '4px' }}>{pendingCount}</span>}
          </div>
          <button className="btn btn-secondary btn-sm" onClick={logout}>Exit</button>
        </div>
      </div>

      {/* Sync Actions */}
      <div className="operator-card" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button className="btn btn-secondary" style={{ flex: 1, minWidth: '120px', justifyContent: 'center' }} onClick={pullAssets}>
          ⬇️ Pull DB
        </button>
        <button className="btn btn-primary" style={{ flex: 1, minWidth: '120px', justifyContent: 'center' }} onClick={pushEvents}>
          ⬆️ Sync ({pendingCount})
        </button>
        {pendingCount > 0 && (
          <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setShowQueue(true)}>
            📋 View Queue
          </button>
        )}
      </div>

      {showQueue && <SyncQueueModal onClose={() => setShowQueue(false)} />}

      {/* ── VIEW: IDLE ─────────────────────────── */}
      {view === 'idle' && (
        <div className="operator-card" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📱</div>
          <h3 style={{ marginBottom: '8px' }}>Ready to Scan</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '24px' }}>
            Scan an asset QR code to log its location or status.
          </p>
          <button
            className="btn btn-primary btn-lg"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => setView('scanning')}
          >
            Start Scanner
          </button>
        </div>
      )}

      {/* ── VIEW: SCANNING ─────────────────────── */}
      {view === 'scanning' && (
        <div className="operator-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px' }}>Point camera at QR Code</h3>
            <button className="btn btn-secondary btn-sm" onClick={goIdle}>Cancel</button>
          </div>
          <QRScanner onScan={handleScan} />
        </div>
      )}

      {/* ── VIEW: RESULT ────────────────────────── */}
      {view === 'result' && (
        <div className="operator-card fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Scanned ID:</div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--accent)' }}>{scannedCode}</div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => { setScannedCode(''); setScannedAsset(null); setView('scanning'); }}
              >
                🔄 Scan Again
              </button>
              <button className="btn btn-secondary btn-sm" onClick={goIdle}>
                ✕ Clear
              </button>
            </div>
          </div>

          {scannedAsset ? (
            <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '12px', marginBottom: '20px' }}>
              <div style={{ fontWeight: '600', fontSize: '16px' }}>{scannedAsset.name}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{scannedAsset.category}</div>
              <div className={`badge badge-${scannedAsset.status}`} style={{ marginTop: '8px' }}>{scannedAsset.status}</div>
            </div>
          ) : (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '16px', borderRadius: '12px', marginBottom: '20px', color: 'var(--danger)', fontSize: '13px' }}>
              ⚠️ Asset not found in local database. You can still log a scan.
            </div>
          )}

          <h4 style={{ fontSize: '14px', marginBottom: '12px', color: 'var(--text-secondary)' }}>Quick Actions</h4>
          <div className="action-btn-grid">
            <button className="action-btn" onClick={() => logEvent('scan')}>
              <span className="action-icon">📍</span> Log Location
            </button>
            <button className="action-btn" onClick={() => logEvent('in-transit')}>
              <span className="action-icon">🚚</span> In Transit
            </button>
            <button className="action-btn" onClick={() => logEvent('maintenance')}>
              <span className="action-icon">🔧</span> Maintenance
            </button>
            <button className="action-btn" onClick={() => logEvent('active')}>
              <span className="action-icon">✅</span> Mark Active
            </button>
            <button className="action-btn" onClick={() => logEvent('lost')} style={{ color: 'var(--danger)' }}>
              <span className="action-icon">🚨</span> Mark Lost
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OperatorDashboard;
