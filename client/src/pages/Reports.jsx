import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { reportAPI, groupAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FiDownload, FiFileText, FiFile } from 'react-icons/fi';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const Reports = () => {
  const { groupId } = useParams();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, [groupId]);

  const fetchDashboard = async () => {
    try {
      const response = await reportAPI.getDashboard(groupId);
      setDashboard(response.data.data);
    } catch (error) {
      toast.error('Không thể tải báo cáo');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    setExporting('pdf');
    try {
      const response = await reportAPI.exportPDF(groupId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report-${dashboard?.group?.name || 'group'}-${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Đã tải báo cáo PDF!');
    } catch (error) {
      toast.error('Không thể xuất báo cáo PDF');
    } finally {
      setExporting(null);
    }
  };

  const handleExportExcel = async () => {
    setExporting('excel');
    try {
      const response = await reportAPI.exportExcel(groupId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report-${dashboard?.group?.name || 'group'}-${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Đã tải báo cáo Excel!');
    } catch (error) {
      toast.error('Không thể xuất báo cáo Excel');
    } finally {
      setExporting(null);
    }
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  const contributions = dashboard?.contributions || [];
  const contributionChartData = contributions.map((c, i) => ({
    name: c.user?.name || 'Unknown',
    value: c.averageProgress || 0,
    fill: COLORS[i % COLORS.length]
  }));

  const taskStatusData = dashboard?.taskStats ? [
    { name: 'Hoàn thành', value: dashboard.taskStats.done, fill: '#10B981' },
    { name: 'Chờ duyệt', value: dashboard.taskStats.pendingReview, fill: '#F59E0B' },
    { name: 'Đang làm', value: dashboard.taskStats.inProgress, fill: '#3B82F6' },
    { name: 'To Do', value: dashboard.taskStats.todo, fill: '#9CA3AF' }
  ] : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Báo cáo nhóm</h1>
          <p className="text-gray-500 mt-1">Nhóm: {dashboard?.group?.name}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportExcel}
            disabled={exporting}
            className="btn-secondary flex items-center gap-2"
          >
            <FiFile size={18} />
            {exporting === 'excel' ? 'Đang xuất...' : 'Xuất Excel'}
          </button>
          <button
            onClick={handleExportPDF}
            disabled={exporting}
            className="btn-primary flex items-center gap-2"
          >
            <FiFileText size={18} />
            {exporting === 'pdf' ? 'Đang xuất...' : 'Xuất PDF'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card text-center">
          <p className="text-3xl font-bold text-primary-600">{dashboard?.taskStats?.total || 0}</p>
          <p className="text-sm text-gray-500">Tổng công việc</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-green-600">{dashboard?.taskStats?.done || 0}</p>
          <p className="text-sm text-gray-500">Hoàn thành</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-blue-600">{dashboard?.taskStats?.inProgress || 0}</p>
          <p className="text-sm text-gray-500">Đang làm</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-red-600">{dashboard?.taskStats?.overdue || 0}</p>
          <p className="text-sm text-gray-500">Quá hạn</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Đóng góp thành viên</h3>
          {contributionChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={contributionChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {contributionChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Tiến độ']} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              Chưa có dữ liệu
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Trạng thái công việc</h3>
          {taskStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={taskStatusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {taskStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              Chưa có dữ liệu
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">Bảng đóng góp chi tiết</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thành viên</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Công việc</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hoàn thành</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tiến độ TB</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Đóng góp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {contributions.map((c, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 font-medium">
                          {c.user?.name?.charAt(0)}
                        </span>
                      </div>
                      <span className="font-medium">{c.user?.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">{c.tasksAssigned}</td>
                  <td className="px-4 py-3">{c.tasksCompleted}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24 progress-bar">
                        <div className="progress-bar-fill" style={{ width: `${c.averageProgress}%` }} />
                      </div>
                      <span>{c.averageProgress}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-primary-600">
                    {c.contributionPercentage}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {dashboard?.recentActivity && dashboard.recentActivity.length > 0 && (
        <div className="card mt-6">
          <h3 className="font-semibold text-gray-900 mb-4">Hoạt động gần đây</h3>
          <div className="space-y-3">
            {dashboard.recentActivity.slice(0, 10).map((activity) => (
              <div key={activity._id} className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                <span className="text-gray-600">{activity.description}</span>
                <span className="text-gray-400 ml-auto">
                  {new Date(activity.createdAt).toLocaleString('vi-VN')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
