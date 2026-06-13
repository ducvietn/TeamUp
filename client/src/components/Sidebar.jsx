import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { 
  FiHome, FiUsers, FiCheckSquare, FiBarChart2, 
  FiStar, FiBell, FiUser, FiLogOut, FiFolder
} from 'react-icons/fi';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { path: '/groups', icon: FiUsers, label: 'Nhóm của tôi' },
    { path: '/tasks', icon: FiCheckSquare, label: 'Công việc của tôi' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">T</span>
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-lg">TeamUp</h1>
            <p className="text-xs text-gray-500">
              {user?.role === 'teacher' ? 'Giảng viên' : 'Sinh viên'}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100 space-y-1">
        <NavLink
          to="/notifications"
          className={({ isActive }) =>
            `sidebar-link relative ${isActive ? 'active' : ''}`
          }
        >
          <FiBell size={20} />
          <span>Thông báo</span>
          {unreadCount > 0 && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </NavLink>
        
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? 'active' : ''}`
          }
        >
          <FiUser size={20} />
          <span>Hồ sơ</span>
        </NavLink>
        
        <button
          onClick={handleLogout}
          className="sidebar-link w-full text-left text-red-600 hover:bg-red-50"
        >
          <FiLogOut size={20} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
