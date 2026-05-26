import { Html5Qrcode } from 'html5-qrcode';
import { useEffect, useRef, useState } from 'react';

const QRScanner = ({ onScan }) => {
  const [status, setStatus] = useState('requesting'); // 'requesting' | 'scanning' | 'error'
  const [errorMsg, setErrorMsg] = useState('');
  const onScanRef = useRef(onScan);
  const scannerRef = useRef(null);
  const startedRef = useRef(false);
  const hasScannedRef = useRef(false); // ONE-SHOT: prevent callback firing twice

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    // Prevent double-init in React StrictMode
    if (startedRef.current) return;
    startedRef.current = true;

    const scanner = new Html5Qrcode('qr-reader-container');
    scannerRef.current = scanner;

    const start = async () => {
      try {
        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 15,
            // Remove tight qrbox to scan from whole frame
            qrbox: (viewfinderWidth, viewfinderHeight) => {
              const size = Math.min(viewfinderWidth, viewfinderHeight) * 0.8;
              return { width: size, height: size };
            },
            aspectRatio: 1.0,
            disableFlip: false,
            experimentalFeatures: {
              useBarCodeDetectorIfSupported: true, // Use native browser API if available (faster)
            },
          },
          (decodedText) => {
            // Block any re-fires while camera is stopping
            if (hasScannedRef.current) return;
            hasScannedRef.current = true;

            const cb = onScanRef.current;
            if (scannerRef.current) {
              const s = scannerRef.current;
              scannerRef.current = null;
              s.stop().catch(console.error);
            }
            cb(decodedText);
          },
          () => {} // suppress frame errors
        );
        setStatus('scanning');
      } catch (err) {
        console.error('Camera error:', err);
        setErrorMsg('Could not access camera. Please allow camera permission and try again.');
        setStatus('error');
      }
    };

    start();

    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
      scannerRef.current = null;
    };
  }, []);

  return (
    <div>
      {/* Camera viewport — always in DOM so Html5Qrcode can mount */}
      <div
        id="qr-reader-container"
        style={{
          width: '100%',
          borderRadius: '12px',
          overflow: 'hidden',
          background: '#000',
          minHeight: status === 'scanning' ? 'auto' : '0',
          display: status === 'error' ? 'none' : 'block',
        }}
      />

      {/* Overlay states */}
      {status === 'requesting' && (
        <div style={{
          background: '#1a1a2e',
          borderRadius: '12px',
          padding: '40px 20px',
          textAlign: 'center',
          border: '2px dashed rgba(255,183,3,0.4)',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📷</div>
          <p style={{ color: '#f8f9fa', fontWeight: '600', fontSize: '16px', marginBottom: '8px' }}>
            Starting Camera...
          </p>
          <p style={{ color: '#adb5bd', fontSize: '13px' }}>
            Your browser will ask for camera permission. Please click <strong style={{ color: '#ffb703' }}>Allow</strong>.
          </p>
          <div style={{
            marginTop: '20px',
            width: '36px', height: '36px',
            border: '3px solid rgba(255,183,3,0.2)',
            borderTopColor: '#ffb703',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '20px auto 0',
          }} />
        </div>
      )}

      {status === 'error' && (
        <div style={{
          background: 'rgba(239,71,111,0.1)',
          border: '1px solid rgba(239,71,111,0.3)',
          borderRadius: '12px',
          padding: '32px 20px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚫</div>
          <p style={{ color: '#f8f9fa', fontWeight: '600', fontSize: '15px', marginBottom: '8px' }}>
            Camera Access Blocked
          </p>
          <p style={{ color: '#adb5bd', fontSize: '13px', marginBottom: '20px' }}>
            {errorMsg}
          </p>
          <button
            style={{
              background: '#ffb703',
              color: '#0b1117',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '14px',
              cursor: 'pointer',
            }}
            onClick={() => window.location.reload()}
          >
            🔄 Retry
          </button>
        </div>
      )}
    </div>
  );
};

export default QRScanner;
