import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      // Redirect based on role
      if (user.role === 'operator') {
        navigate('/operator');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', padding: '20px' }}>
      <div className="card" style={{ width: '100%', maxWidth: '420px', padding: '40px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div className="logo-icon" style={{ margin: '0 auto 16px' }}>🐆</div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>AssetCheetah</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Industrial Asset Management</p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--danger)', padding: '12px 16px', borderRadius: '8px', fontSize: '13px', marginBottom: '24px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. admin@assetcheetah.com"
              required
            />
          </div>
          <div className="form-group" style={{ marginBottom: '32px' }}>
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
          <p>Demo Accounts:</p>
          <p>admin@assetcheetah.com / admin123</p>
          <p>operator@assetcheetah.com / operator123</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
