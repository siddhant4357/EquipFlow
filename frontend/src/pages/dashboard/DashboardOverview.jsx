import { useState, useEffect } from 'react';
import { dashboardService } from '../../services/dataService';

const DashboardOverview = () => {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, activityData] = await Promise.all([
          dashboardService.getOverview(),
          dashboardService.getActivity(10),
        ]);
        setStats(statsData.data);
        setActivity(activityData.data);
      } catch (error) {
        console.error('Error fetching dashboard data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="spinner" style={{ margin: '40px auto', width: '32px', height: '32px', border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%' }} />;

  return (
    <div className="fade-in">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: 'var(--info)' }}>📦</div>
          <div className="stat-info">
            <div className="value">{stats?.totalAssets || 0}</div>
            <div className="label">Total Assets</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)' }}>✅</div>
          <div className="stat-info">
            <div className="value">{stats?.active || 0}</div>
            <div className="label">Active Assets</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)' }}>🔧</div>
          <div className="stat-info">
            <div className="value">{stats?.inMaintenance || 0}</div>
            <div className="label">In Maintenance</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger)' }}>🚨</div>
          <div className="stat-info">
            <div className="value">{stats?.lost || 0}</div>
            <div className="label">Lost / Missing</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <button 
          className="btn btn-primary" 
          onClick={async () => {
            try {
              setLoading(true);
              await dashboardService.runPredictions();
              const statsData = await dashboardService.getOverview();
              setStats(statsData.data);
            } catch (err) {
              console.error('AI run failed', err);
              alert('Failed to run AI predictions. Ensure the AI Microservice (python main.py) is running on port 8001.');
            } finally {
              setLoading(false);
            }
          }}
        >
          <span className="icon">🧠</span> Run AI Predictive Analysis
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        
        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Activity (Last 24h)</h3>
            <div className="badge badge-admin">{stats?.eventsLast24h || 0} Events</div>
          </div>
          
          {activity.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <p>No recent asset activity found.</p>
            </div>
          ) : (
            <div>
              {activity.map((event) => (
                <div key={event._id} className="activity-item">
                  <div className="activity-dot" style={{ background: 'var(--bg-card-hover)' }}>
                    {event.eventType === 'scan' ? '📱' : event.eventType === 'maintenance' ? '🔧' : event.eventType === 'in-transit' ? '🚚' : 'ℹ️'}
                  </div>
                  <div className="activity-info">
                    <div className="title">
                      <span style={{ color: 'var(--accent)', fontWeight: '600' }}>{event.assetId?.assetId}</span> 
                      {' '}was marked as <b>{event.eventType}</b> by {event.operatorId?.name}
                    </div>
                    <div className="sub">
                      {new Date(event.createdAt).toLocaleString()} • {event.location?.address || 'Unknown location'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Maintenance Alerts */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Maintenance Alerts</h3>
            {stats?.overdueAssets?.length > 0 && (
              <div className="badge badge-danger">{stats.overdueAssets.length} Overdue</div>
            )}
          </div>
          
          {(!stats?.overdueAssets || stats.overdueAssets.length === 0) ? (
            <div className="empty-state">
              <div className="empty-icon" style={{ color: 'var(--success)' }}>✅</div>
              <p>All assets are up to date on maintenance!</p>
            </div>
          ) : (
            <div>
              {stats.overdueAssets.map((asset) => (
                <div key={asset._id} className="activity-item">
                  <div className="activity-dot" style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger)' }}>
                    ⚠️
                  </div>
                  <div className="activity-info">
                    <div className="title">
                      <span style={{ color: 'var(--accent)', fontWeight: '600' }}>{asset.assetId}</span> ({asset.name})
                    </div>
                    <div className="sub" style={{ color: 'var(--danger)' }}>
                      Due: {new Date(asset.nextMaintenanceDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Predictive Alerts */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">AI Predictive Alerts 🧠</h3>
            {stats?.atRiskAssets?.length > 0 && (
              <div className="badge badge-danger">{stats.atRiskAssets.length} At Risk</div>
            )}
          </div>
          
          {(!stats?.atRiskAssets || stats.atRiskAssets.length === 0) ? (
            <div className="empty-state">
              <div className="empty-icon" style={{ color: 'var(--success)' }}>🤖</div>
              <p>AI predicts all equipment is healthy.</p>
            </div>
          ) : (
            <div>
              {stats.atRiskAssets.map((asset) => (
                <div key={asset._id} className="activity-item">
                  <div className="activity-dot" style={{ background: asset.aiFailureRisk > 0.75 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)', color: asset.aiFailureRisk > 0.75 ? 'var(--danger)' : 'var(--warning)' }}>
                    {asset.aiFailureRisk > 0.75 ? '🔴' : '🟡'}
                  </div>
                  <div className="activity-info">
                    <div className="title">
                      <span style={{ color: 'var(--accent)', fontWeight: '600' }}>{asset.assetId}</span> ({asset.name})
                    </div>
                    <div className="sub" style={{ color: asset.aiFailureRisk > 0.75 ? 'var(--danger)' : 'var(--warning)' }}>
                      Failure Probability: {(asset.aiFailureRisk * 100).toFixed(1)}%
                    </div>
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

export default DashboardOverview;
