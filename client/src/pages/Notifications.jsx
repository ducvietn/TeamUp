import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import toast from 'react-hot-toast';
import { FiBell, FiCheck, FiTrash2, FiCheckCircle, FiAlertCircle, FiInfo } from 'react-icons/fi';

const Notifications = () => {
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'warning':
        return <FiAlertCircle size={20} className="text-orange-500" />;
      case 'success':
        return <FiCheckCircle size={20} className="text-green-500" />;
      case 'error':
        return <FiAlertCircle size={20} className="text-red-500" />;
      default:
        return <FiInfo size={20} className="text-blue-500" />;
    }
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    toast.success('Đã đánh dấu tất cả là đã đọc');
  };

  const handleMarkRead = async (id) => {
    await markAsRead(id);
  };

  const handleDelete = async (id) => {
    await deleteNotification(id);
    toast.success('Đã xóa thông báo');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Thông báo</h1>
          <p className="text-gray-500 mt-1">
            {unreadCount > 0 ? `${unreadCount} thông báo chưa đọc` : 'Tất cả đã đọc'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="btn-secondary flex items-center gap-2"
          >
            <FiCheck size={18} />
            Đánh dấu tất cả đã đọc
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="card text-center py-12">
          <FiBell size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Không có thông báo nào</h3>
          <p className="text-gray-500">Bạn sẽ nhận được thông báo khi có cập nhật mới</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
          {notifications.map((notification) => (
            <div
              key={notification._id}
              className={`p-4 hover:bg-gray-50 transition-colors ${
                !notification.read ? 'bg-primary-50/30' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <h4 className={`font-medium ${
                    !notification.read ? 'text-gray-900' : 'text-gray-700'
                  }`}>
                    {notification.title}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {notification.message}
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs text-gray-400">
                      {new Date(notification.createdAt).toLocaleString('vi-VN')}
                    </span>
                    {notification.link && (
                      <Link
                        to={notification.link}
                        className="text-xs text-primary-600 hover:underline"
                        onClick={() => !notification.read && handleMarkRead(notification._id)}
                      >
                        Xem chi tiết
                      </Link>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!notification.read && (
                    <button
                      onClick={() => handleMarkRead(notification._id)}
                      className="p-2 hover:bg-gray-200 rounded-lg text-gray-500"
                      title="Đánh dấu đã đọc"
                    >
                      <FiCheck size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notification._id)}
                    className="p-2 hover:bg-red-100 rounded-lg text-gray-500 hover:text-red-600"
                    title="Xóa"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
