import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { groupAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await groupAPI.getMyGroups();
      setGroups(response.data.data.groups);
    } catch (error) {
      toast.error('Không thể tải danh sách nhóm');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (group) => {
    const isLeader = group.leader?._id === user?._id;
    return isLeader ? (
      <span className="badge bg-primary-100 text-primary-700">Trưởng nhóm</span>
    ) : (
      <span className="badge bg-gray-100 text-gray-600">Thành viên</span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Tổng quan về các nhóm của bạn</p>
        </div>
        <Link to="/groups/create" className="btn-primary">
          + Tạo nhóm mới
        </Link>
      </div>

      {groups.length === 0 ? (
        <div className="card text-center py-12">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có nhóm nào</h3>
          <p className="text-gray-500 mb-6">Tham gia hoặc tạo nhóm mới để bắt đầu</p>
          <div className="flex gap-4 justify-center">
            <Link to="/groups/create" className="btn-primary">
              Tạo nhóm mới
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <Link key={group._id} to={`/groups/${group._id}`}>
              <div className="card hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <span className="text-primary-600 font-bold text-lg">
                      {group.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  {getRoleBadge(group)}
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{group.name}</h3>
                <p className="text-sm text-gray-500 mb-4">Lớp: {group.classId}</p>
                
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {group.members?.length || 0} thành viên
                  </span>
                </div>
                
                {group.leader && (
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-600">
                        {group.leader.name?.charAt(0)}
                      </span>
                    </div>
                    <span className="text-sm text-gray-600">
                      Trưởng nhóm: {group.leader.name}
                    </span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
