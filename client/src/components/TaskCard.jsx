import { Link } from 'react-router-dom';
import { FiClock, FiAlertCircle, FiCheckCircle, FiUser } from 'react-icons/fi';

const TaskCard = ({ task, showGroup = false }) => {
  const statusConfig = {
    todo: { label: 'To Do', color: 'bg-gray-100 text-gray-600', icon: FiClock },
    in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-600', icon: FiClock },
    pending_review: { label: 'Pending', color: 'bg-yellow-100 text-yellow-600', icon: FiAlertCircle },
    done: { label: 'Done', color: 'bg-green-100 text-green-600', icon: FiCheckCircle }
  };

  const status = statusConfig[task.status] || statusConfig.todo;
  const StatusIcon = status.icon;

  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== 'done';
  const daysUntilDeadline = task.deadline 
    ? Math.ceil((new Date(task.deadline) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`badge ${status.color}`}>
            <StatusIcon size={12} className="mr-1" />
            {status.label}
          </span>
          {task.difficulty && (
            <span className={`badge ${
              task.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
              task.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {task.difficulty === 'easy' ? 'Dễ' : task.difficulty === 'medium' ? 'TB' : 'Khó'}
            </span>
          )}
        </div>
        {task.isFrozen && (
          <span className="badge bg-orange-100 text-orange-700">Bị đóng băng</span>
        )}
      </div>

      <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">{task.title}</h4>
      
      {task.description && (
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{task.description}</p>
      )}

      {showGroup && task.group && (
        <p className="text-xs text-primary-600 font-medium mb-3">
          Nhóm: {task.group.name}
        </p>
      )}

      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Tiến độ</span>
          <span className="font-medium">{task.progress}%</span>
        </div>
        <div className="progress-bar">
          <div 
            className={`progress-bar-fill ${task.progress === 100 ? 'bg-green-500' : 'bg-primary-500'}`}
            style={{ width: `${task.progress}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        {task.assignedTo && (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-gray-600">
                {task.assignedTo.name?.charAt(0)}
              </span>
            </div>
            <span className="text-gray-600 text-xs">{task.assignedTo.name}</span>
          </div>
        )}

        {task.deadline && (
          <div className={`flex items-center gap-1 text-xs ${
            isOverdue ? 'text-red-600' : 
            daysUntilDeadline <= 2 ? 'text-orange-600' : 'text-gray-500'
          }`}>
            <FiClock size={14} />
            <span>
              {isOverdue ? 'Quá hạn' : 
               daysUntilDeadline === 0 ? 'Hôm nay' :
               daysUntilDeadline === 1 ? 'Ngày mai' :
               `${daysUntilDeadline} ngày`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
