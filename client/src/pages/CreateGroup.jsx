import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { groupAPI } from '../services/api';
import toast from 'react-hot-toast';

const CreateGroup = () => {
  const [formData, setFormData] = useState({
    name: '',
    classId: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await groupAPI.create(formData);
      toast.success('Tạo nhóm thành công!');
      navigate(`/groups/${response.data.data.group._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể tạo nhóm');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tạo nhóm mới</h1>
        <p className="text-gray-500 mt-1">Điền thông tin để tạo nhóm học tập mới</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên nhóm <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input-field"
              placeholder="VD: Nhóm 1 - CNTT K62"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mã lớp <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="classId"
              value={formData.classId}
              onChange={handleChange}
              className="input-field"
              placeholder="VD: CNT62A"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input-field min-h-[120px] resize-y"
              placeholder="Mô tả ngắn về nhóm (không bắt buộc)"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/groups')}
              className="btn-secondary flex-1"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? 'Đang tạo...' : 'Tạo nhóm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroup;
