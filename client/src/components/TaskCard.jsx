const TaskCard = ({ task, showGroup = false }) => {
  const statusConfig = {
    todo: { label: 'To Do', bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' },
    in_progress: { label: 'In Progress', bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-500' },
    pending_review: { label: 'Pending', bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500' },
    done: { label: 'Done', bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500' }
  };

  const status = statusConfig[task.status] || statusConfig.todo;
  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== 'done';
  const daysUntilDeadline = task.deadline
    ? Math.ceil((new Date(task.deadline) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100/80 p-5 hover:shadow-lg hover:shadow-gray-200/40 hover:-translate-y-0.5 transition-all duration-300 group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${status.bg} ${status.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
            {status.label}
          </span>
          {task.difficulty && (
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
              task.difficulty === 'easy' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
              task.difficulty === 'medium' ? 'bg-amber-50 text-amber-600 border-amber-200' :
              'bg-red-50 text-red-600 border-red-200'
            }`}>
              {task.difficulty === 'easy' ? 'Dễ' : task.difficulty === 'medium' ? 'TB' : 'Khó'}
            </span>
          )}
        </div>
        {task.isFrozen && (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 border border-orange-200">
            Bị đóng băng
          </span>
        )}
      </div>

      <h4 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">{task.title}</h4>

      {task.description && (
        <p className="text-sm text-gray-400 mb-4 line-clamp-2 font-medium">{task.description}</p>
      )}

      {showGroup && task.group && (
        <p className="text-xs text-primary-600 font-semibold mb-3">Nhóm: {task.group.name}</p>
      )}

      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1.5">
          <span className="font-medium">Tiến độ</span>
          <span className="font-bold text-gray-700">{task.progress}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              task.progress === 100
                ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                : 'bg-gradient-to-r from-primary-500 to-primary-600'
            }`}
            style={{ width: `${task.progress}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        {task.assignedTo ? (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white text-xs font-bold">{task.assignedTo.name?.charAt(0)}</span>
            </div>
            <span className="text-gray-600 text-xs font-medium">{task.assignedTo.name}</span>
          </div>
        ) : <div />}

        {task.deadline && (
          <div className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg ${
            isOverdue ? 'bg-red-50 text-red-600' :
            daysUntilDeadline <= 2 ? 'bg-amber-50 text-amber-600' :
            'bg-gray-50 text-gray-500'
          }`}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
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
