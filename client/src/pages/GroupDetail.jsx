import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { groupAPI, taskAPI, reportAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiUsers, FiCopy, FiPlus, FiSettings, FiBarChart2, FiStar, FiEdit2 } from 'react-icons/fi';
import TaskCard from '../components/TaskCard';
import ContributionChart from '../components/ContributionChart';

const GroupDetail = () => {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignedTo: '',
    deadline: '',
    estimatedHours: '',
    difficulty: 'medium'
  });
  const { user } = useAuth();
  const navigate = useNavigate();

  const isLeader = group?.leader?._id === user?._id;

  useEffect(() => {
    fetchGroupData();
  }, [groupId]);

  const fetchGroupData = async () => {
    try {
      const [groupRes, tasksRes, statsRes] = await Promise.all([
        groupAPI.getById(groupId),
        taskAPI.getByGroup(groupId),
        reportAPI.getContribution(groupId)
      ]);
      setGroup(groupRes.data.data.group);
      setTasks(tasksRes.data.data.tasks);
      setStats(statsRes.data.data);
    } catch (error) {
      toast.error('Không thể tải thông tin nhóm');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await taskAPI.create({ ...newTask, groupId });
      toast.success('Tạo công việc thành công!');
      setShowCreateTask(false);
      setNewTask({ title: '', description: '', assignedTo: '', deadline: '', estimatedHours: '', difficulty: 'medium' });
      fetchGroupData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể tạo công việc');
    }
  };

  const copyInviteCode = () => {
    navigator.clipboard.writeText(group?.inviteCode);
    toast.success('Đã copy mã mời!');
  };

  const enablePeerReview = async () => {
    try {
      await groupAPI.enablePeerReview(groupId);
      toast.success('Đã bật đánh giá ngang hàng!');
      fetchGroupData();
    } catch (error) {
      toast.error('Không thể bật đánh giá ngang hàng');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!group) {
    return <div>Nhóm không tồn tại</div>;
  }

  const statusColors = {
    todo: 'bg-gray-100 text-gray-600',
    in_progress: 'bg-blue-100 text-blue-600',
    pending_review: 'bg-yellow-100 text-yellow-600',
    done: 'bg-green-100 text-green-600'
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{group.name}</h1>
          <p className="text-gray-500 mt-1">Lớp: {group.classId}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to={`/reports/${groupId}`}
            className="btn-secondary flex items-center gap-2"
          >
            <FiBarChart2 size={18} />
            Báo cáo
          </Link>
          {group.peerReviewEnabled && (
            <Link
              to={`/peer-review/${groupId}`}
              className="btn-secondary flex items-center gap-2"
            >
              <FiStar size={18} />
              Đánh giá
            </Link>
          )}
          {isLeader && (
            <button onClick={enablePeerReview} className="btn-secondary flex items-center gap-2">
              <FiStar size={18} />
              Bật Peer Review
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Thông tin nhóm</h3>
            {isLeader && (
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <FiSettings size={18} className="text-gray-500" />
              </button>
            )}
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Mã mời</p>
              <div className="flex items-center gap-2 mt-1">
                <code className="bg-primary-50 text-primary-700 px-3 py-1 rounded font-mono font-bold">
                  {group.inviteCode}
                </code>
                <button onClick={copyInviteCode} className="p-2 hover:bg-gray-100 rounded">
                  <FiCopy size={16} />
                </button>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Trưởng nhóm</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-medium">
                    {group.leader?.name?.charAt(0)}
                  </span>
                </div>
                <span className="font-medium">{group.leader?.name}</span>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Thành viên</p>
              <p className="font-medium mt-1">{group.members?.length || 0} người</p>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Tiến độ nhóm</h3>
          {stats && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tổng công việc</span>
                <span className="font-bold">{stats.totalTasks}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Hoàn thành</span>
                <span className="font-bold text-green-600">{stats.completedTasks}</span>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Tiến độ chung</span>
                  <span className="font-medium">
                    {stats.totalTasks > 0 
                      ? Math.round((stats.completedTasks / stats.totalTasks) * 100) 
                      : 0}%
                  </span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-bar-fill" 
                    style={{ 
                      width: `${stats.totalTasks > 0 
                        ? (stats.completedTasks / stats.totalTasks) * 100 
                        : 0}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Đóng góp thành viên</h3>
          {stats?.contributions && stats.contributions.length > 0 && (
            <ContributionChart data={stats.contributions} />
          )}
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Công việc</h3>
          {isLeader && (
            <button
              onClick={() => setShowCreateTask(true)}
              className="btn-primary flex items-center gap-2"
            >
              <FiPlus size={18} />
              Thêm công việc
            </button>
          )}
        </div>

        {tasks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Chưa có công việc nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tasks.map((task) => (
              <Link key={task._id} to={`/tasks/${task._id}`}>
                <TaskCard task={task} />
              </Link>
            ))}
          </div>
        )}
      </div>

      {showCreateTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Tạo công việc mới
            </h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên công việc <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="input-field"
                  placeholder="VD: Làm slide giới thiệu"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="input-field min-h-[80px] resize-y"
                  placeholder="Mô tả chi tiết công việc"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giao cho
                </label>
                <select
                  value={newTask.assignedTo}
                  onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                  className="input-field"
                >
                  <option value="">Chọn thành viên</option>
                  {group.members?.map((m) => (
                    <option key={m.user._id} value={m.user._id}>
                      {m.user.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deadline
                  </label>
                  <input
                    type="date"
                    value={newTask.deadline}
                    onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ước lượng (giờ)
                  </label>
                  <input
                    type="number"
                    value={newTask.estimatedHours}
                    onChange={(e) => setNewTask({ ...newTask, estimatedHours: e.target.value })}
                    className="input-field"
                    min="0"
                    placeholder="VD: 4"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Độ khó
                </label>
                <select
                  value={newTask.difficulty}
                  onChange={(e) => setNewTask({ ...newTask, difficulty: e.target.value })}
                  className="input-field"
                >
                  <option value="easy">Dễ</option>
                  <option value="medium">Trung bình</option>
                  <option value="hard">Khó</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateTask(false)}
                  className="btn-secondary flex-1"
                >
                  Hủy
                </button>
                <button type="submit" className="btn-primary flex-1">
                  Tạo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupDetail;
