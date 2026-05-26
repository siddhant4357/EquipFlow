import { useState, useEffect } from 'react';
import { userService } from '../../services/dataService';
import UserForm from './UserForm';

const PeopleList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await userService.getAll();
      setUsers(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeactivate = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this user?')) return;
    try {
      await userService.deactivate(id);
      fetchUsers();
    } catch (e) {
      alert('Failed to deactivate user');
    }
  };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700' }}>Manage People</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <span style={{ fontSize: '16px' }}>+</span> Add New User
        </button>
      </div>

      <div className="card table-wrapper" style={{ padding: '0' }}>
        {loading ? (
           <div className="spinner" style={{ margin: '40px auto', width: '32px', height: '32px', border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%' }} />
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td style={{ fontWeight: '500' }}>{u.name}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{u.email}</td>
                  <td>
                    <span className={`badge badge-${u.role}`}>{u.role}</span>
                  </td>
                  <td>
                    {u.isActive ? (
                      <span className="badge badge-active">Active</span>
                    ) : (
                      <span className="badge badge-retired">Inactive</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button 
                      className="btn btn-danger btn-sm" 
                      onClick={() => handleDeactivate(u._id)}
                      disabled={!u.isActive}
                    >
                      Deactivate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <UserForm 
          onClose={() => setShowForm(false)} 
          onSuccess={() => { setShowForm(false); fetchUsers(); }} 
        />
      )}
    </div>
  );
};

export default PeopleList;
