import { useState, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { assetService } from '../../services/dataService';
import { useAuth } from '../../context/AuthContext';
import AssetForm from './AssetForm';
import QRModal from './QRModal';
import AssetHistoryModal from './AssetHistoryModal';
import BulkQRExport from './components/BulkQRExport';

const AssetList = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modals
  const [showForm, setShowForm] = useState(false);
  const [showQR, setShowQR] = useState(null);
  const [showHistory, setShowHistory] = useState(null);
  
  const { isAdmin } = useAuth();
  const printRef = useRef();

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: 'EquipFlow_QRCodes',
  });

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const { data } = await assetService.getAll({ search });
      setAssets(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchAssets();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div className="search-bar" style={{ width: '300px' }}>
          <span>🔍</span>
          <input 
            type="text" 
            placeholder="Search assets by name or ID..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={() => handlePrint()}>
            <span style={{ fontSize: '16px' }}>🖨️</span> Bulk Export QRs
          </button>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <span style={{ fontSize: '16px' }}>+</span> Add New Asset
          </button>
        </div>
      </div>

      <div className="card table-wrapper" style={{ padding: '0' }}>
        {loading ? (
           <div className="spinner" style={{ margin: '40px auto', width: '32px', height: '32px', border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%' }} />
        ) : assets.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <p>No assets found matching your criteria.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Asset ID</th>
                <th>Name</th>
                <th>Category</th>
                <th>Status</th>
                <th>AI Risk Score</th>
                <th>Assigned To</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset) => (
                <tr key={asset._id}>
                  <td style={{ fontWeight: '600', color: 'var(--accent)' }}>{asset.assetId}</td>
                  <td>{asset.name}</td>
                  <td style={{ textTransform: 'capitalize' }}>{asset.category}</td>
                  <td>
                    <span className={`badge badge-${asset.status}`}>{asset.status}</span>
                  </td>
                  <td>
                    {asset.aiFailureRisk != null ? (
                      <span className={`badge`} style={{
                        background: asset.aiFailureRisk > 0.75 ? 'rgba(239, 68, 68, 0.15)' : (asset.aiFailureRisk > 0.5 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)'),
                        color: asset.aiFailureRisk > 0.75 ? 'var(--danger)' : (asset.aiFailureRisk > 0.5 ? 'var(--warning)' : 'var(--success)')
                      }}>
                        {asset.aiFailureRisk > 0.75 ? '🔴' : (asset.aiFailureRisk > 0.5 ? '🟡' : '🟢')} {(asset.aiFailureRisk * 100).toFixed(0)}%
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Not analyzed</span>
                    )}
                  </td>
                  <td>{asset.assignedTo?.name || <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>}</td>
                  <td style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => setShowHistory(asset)}>
                      History
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={() => setShowQR(asset)}>
                      QR Code
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <AssetForm 
          onClose={() => setShowForm(false)} 
          onSuccess={() => { setShowForm(false); fetchAssets(); }} 
        />
      )}
      
      {showQR && (
        <QRModal asset={showQR} onClose={() => setShowQR(null)} />
      )}

      {showHistory && (
        <AssetHistoryModal asset={showHistory} onClose={() => setShowHistory(null)} />
      )}

      {/* Hidden Printable Content */}
      <div style={{ display: 'none' }}>
        <BulkQRExport ref={printRef} assets={assets} />
      </div>
    </div>
  );
};

export default AssetList;
