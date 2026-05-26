import { useState } from 'react';
import { userService } from '../../services/dataService';

const UserForm = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'operator',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await userService.create(formData);
      onSuccess();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3 className="modal-title">Add New User</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Name *</label>
            <input 
              required 
              type="text" 
              className="form-input" 
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})} 
              placeholder="Full Name"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input 
              required 
              type="email" 
              className="form-input" 
              value={formData.email} 
              onChange={(e) => setFormData({...formData, email: e.target.value})} 
              placeholder="email@example.com"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password *</label>
            <input 
              required 
              type="password" 
              className="form-input" 
              value={formData.password} 
              onChange={(e) => setFormData({...formData, password: e.target.value})} 
              placeholder="Minimum 6 characters"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Role</label>
            <select className="form-input" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
              <option value="operator">Operator (Mobile Scanner Only)</option>
              <option value="manager">Manager (Dashboard View Only)</option>
              <option value="admin">Admin (Full Access)</option>
            </select>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;
