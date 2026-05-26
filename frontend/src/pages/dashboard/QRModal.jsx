import { assetService } from '../../services/dataService';
import { useState } from 'react';

const QRModal = ({ asset, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState(asset.qrCode);

  const handleRegenerate = async () => {
    setLoading(true);
    try {
      const res = await assetService.regenerateQR(asset._id);
      setQrCode(res.qrCode);
    } catch (e) {
      alert('Failed to regenerate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: '400px', textAlign: 'center' }}>
        <h3 className="modal-title" style={{ marginBottom: '8px' }}>Asset QR Code</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '24px' }}>
          {asset.name} ({asset.assetId})
        </p>

        {qrCode ? (
          <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', display: 'inline-block', marginBottom: '24px' }}>
            <img src={qrCode} alt="QR Code" style={{ width: '200px', height: '200px', display: 'block' }} />
          </div>
        ) : (
          <div style={{ padding: '40px', color: 'var(--danger)' }}>No QR Code found</div>
        )}

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
          <a href={qrCode} download={`Asset_${asset.assetId}.png`} className="btn btn-primary">
            💾 Download PNG
          </a>
        </div>
      </div>
    </div>
  );
};

export default QRModal;
