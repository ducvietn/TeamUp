import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { FiBell, FiSearch } from 'react-icons/fi';

const Header = () => {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100/80 sticky top-0 z-30">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold text-gray-900">
            Xin chào, <span className="text-primary-600">{user?.name?.split(' ').pop() || user?.name}!</span>
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/notifications')}
            className="relative p-2.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200"
          >
            <FiBell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] font-extrabold rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-md shadow-primary-500/20">
              <span className="text-white font-bold text-sm">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-400 font-medium">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
