import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { taskAPI } from '../services/api';
import TaskCard from '../components/TaskCard';
import toast from 'react-hot-toast';
import { FiFilter } from 'react-icons/fi';

const MyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchTasks();
  }, [filter]);

  const fetchTasks = async () => {
    try {
      const status = filter === 'all' ? undefined : filter;
      const response = await taskAPI.getMyTasks(status);
      setTasks(response.data.data.tasks);
    } catch (error) {
      toast.error('Không thể tải công việc');
    } finally {
      setLoading(false);
    }
  };

  const filters = [
    { value: 'all', label: 'Tất cả' },
    { value: 'todo', label: 'To Do' },
    { value: 'in_progress', label: 'Đang làm' },
    { value: 'pending_review', label: 'Chờ duyệt' },
    { value: 'done', label: 'Hoàn thành' }
  ];

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
          <h1 className="text-2xl font-bold text-gray-900">Công việc của tôi</h1>
          <p className="text-gray-500 mt-1">Danh sách công việc được giao</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {filters.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === value
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tasks.length === 0 ? (
        <div className="card text-center py-12">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Không có công việc nào</h3>
          <p className="text-gray-500">
            {filter === 'all' 
              ? 'Bạn chưa được giao công việc nào'
              : 'Không có công việc với bộ lọc này'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <Link key={task._id} to={`/tasks/${task._id}`}>
              <TaskCard task={task} showGroup />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTasks;
