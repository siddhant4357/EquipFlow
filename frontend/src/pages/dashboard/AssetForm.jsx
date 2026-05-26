import { useState } from 'react';
import { assetService } from '../../services/dataService';

const AssetForm = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'other',
    description: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await assetService.create(formData);
      onSuccess();
    } catch (error) {
      console.error(error);
      alert('Failed to create asset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3 className="modal-title">Add New Asset</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Asset Name *</label>
            <input 
              required 
              type="text" 
              className="form-input" 
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})} 
              placeholder="e.g. Heavy Duty Drill"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-input" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
              <option value="machinery">Machinery</option>
              <option value="vehicle">Vehicle</option>
              <option value="tool">Tool</option>
              <option value="it-equipment">IT Equipment</option>
              <option value="furniture">Furniture</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea 
              className="form-input" 
              rows="3"
              value={formData.description} 
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Optional details..."
            ></textarea>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Create Asset & Generate QR'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssetForm;
