import React from 'react';

const BulkQRExport = React.forwardRef(({ assets }, ref) => {
  return (
    <div ref={ref} style={{ padding: '20px', background: '#fff', minHeight: '100vh', color: '#000' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px', fontFamily: 'sans-serif' }}>AssetCheetah - QR Code Export</h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '20px',
        alignItems: 'start'
      }}>
        {assets.map((asset) => (
          <div key={asset._id} style={{
            border: '1px solid #ccc',
            padding: '16px',
            textAlign: 'center',
            borderRadius: '8px',
            pageBreakInside: 'avoid'
          }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontFamily: 'sans-serif' }}>{asset.name}</h4>
            <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#666', fontFamily: 'sans-serif' }}>ID: {asset.assetId}</p>
            {asset.qrCode ? (
              <img src={asset.qrCode} alt={`QR Code for ${asset.assetId}`} style={{ width: '150px', height: '150px', display: 'block', margin: '0 auto' }} />
            ) : (
              <div style={{ width: '150px', height: '150px', border: '1px dashed #ccc', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#999' }}>
                No QR Code
              </div>
            )}
            <p style={{ margin: '12px 0 0 0', fontSize: '10px', color: '#999', fontFamily: 'sans-serif' }}>AssetCheetah &copy; {new Date().getFullYear()}</p>
          </div>
        ))}
      </div>
    </div>
  );
});

export default BulkQRExport;
