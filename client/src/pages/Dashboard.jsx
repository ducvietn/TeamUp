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
      <span className="badge bg-gradient-to-r from-primary-100 to-blue-100 text-primary-700 font-semibold border border-primary-200">
        Trưởng nhóm
      </span>
    ) : (
      <span className="badge bg-gray-100 text-gray-600 font-medium">
        Thành viên
      </span>
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-gray-400 mt-1 font-medium text-sm">Tổng quan về các nhóm của bạn</p>
        </div>
        <Link to="/groups/create" className="btn-primary flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Tạo nhóm mới
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Tổng nhóm', value: groups.length, bg: 'bg-blue-50', iconColor: 'text-blue-600', icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )},
          { label: 'Làm trưởng nhóm', value: groups.filter(g => g.leader?._id === user?._id).length, bg: 'bg-emerald-50', iconColor: 'text-emerald-600', icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          )},
          { label: 'Tổng thành viên', value: groups.reduce((sum, g) => sum + (g.members?.length || 0), 0), bg: 'bg-violet-50', iconColor: 'text-violet-600', icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          )},
        ].map((stat) => (
          <div key={stat.label} className="card-hover flex items-center gap-4">
            <div className={`${stat.bg} p-3 rounded-2xl`}>
              <div className={stat.iconColor}>{stat.icon}</div>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500 font-medium mt-0.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Groups Grid */}
      {groups.length === 0 ? (
        <div className="card text-center py-16">
          <div className="w-24 h-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có nhóm nào</h3>
          <p className="text-gray-400 mb-8 max-w-sm mx-auto font-medium">Tham gia hoặc tạo nhóm mới để bắt đầu cộng tác với đồng đội</p>
          <div className="flex gap-4 justify-center">
            <Link to="/groups/create" className="btn-primary">
              Tạo nhóm mới
            </Link>
          </div>
        </div>
      ) : (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Nhóm của bạn</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {groups.map((group) => (
              <Link key={group._id} to={`/groups/${group._id}`}>
                <div className="card-hover cursor-pointer group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-indigo-100 rounded-2xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                      <span className="text-primary-600 font-extrabold text-lg">
                        {group.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    {getRoleBadge(group)}
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
                    {group.name}
                  </h3>
                  <p className="text-sm text-gray-400 font-medium mb-5">
                    Lớp: {group.classId || '—'}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1.5 font-medium">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {group.members?.length || 0} thành viên
                    </span>
                  </div>

                  {group.leader && (
                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2">
                      <div className="w-7 h-7 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center shadow-sm">
                        <span className="text-white text-xs font-bold">
                          {group.leader.name?.charAt(0)}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600 font-medium">
                        Trưởng nhóm: {group.leader.name}
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
