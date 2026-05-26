import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSync } from '../../context/SyncContext';

const Layout = () => {
  const { user, logout, isAdmin, isManager, isOperator } = useAuth();
  const { isOnline, pendingCount, isSyncing, pushEvents, pullAssets } = useSync();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [];
  if (isAdmin || isManager) {
    navLinks.push({ path: '/dashboard', label: 'Overview', icon: '📊' });
    navLinks.push({ path: '/dashboard/map', label: 'Live Map', icon: '🗺️' });
    navLinks.push({ path: '/dashboard/assets', label: 'Assets', icon: '📦' });
  }
  if (isAdmin) {
    navLinks.push({ path: '/dashboard/people', label: 'People', icon: '👥' });
  }

  // Operator uses a different layout (mobile first), this layout is for Admin/Manager
  if (isOperator) {
    return <Outlet />;
  }

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="logo-icon">⚡</div>
          <div>
            <h1>Equip<span>Flow</span></h1>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Menu</div>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
            >
              <span className="icon">{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div style={{ padding: '16px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--bg-card-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              {user?.name?.charAt(0)}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{user?.name}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }} className={`badge badge-${user?.role} mt-1`}>
                {user?.role}
              </div>
            </div>
          </div>
          <button className="nav-link" style={{ color: 'var(--danger)' }} onClick={handleLogout}>
            <span className="icon">🚪</span>
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <h2>{navLinks.find((l) => l.path === location.pathname)?.label || 'Dashboard'}</h2>
            <p>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="topbar-right">
             <div className={`sync-indicator ${isOnline ? 'online' : 'offline'}`}>
                <div className={`sync-dot ${isOnline ? 'online' : 'offline'}`} />
                {isOnline ? 'Online' : 'Offline'}
                {pendingCount > 0 && <span style={{ marginLeft: '4px', background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: '4px' }}>{pendingCount}</span>}
              </div>
          </div>
        </header>
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
