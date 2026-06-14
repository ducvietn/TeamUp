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
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-100/80 flex flex-col shadow-soft">
      <div className="p-6 border-b border-gray-100/80">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-primary-500 to-violet-400 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/25 shrink-0">
            <span className="text-white font-extrabold text-lg">T</span>
          </div>
          <div className="min-w-0">
            <h1 className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-violet-500 text-lg tracking-tight">TeamUp</h1>
            <p className="text-xs text-violet-400 font-medium">
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
            <span className="ml-auto bg-gradient-to-r from-violet-400 to-purple-500 text-white text-[10px] font-extrabold rounded-full px-1.5 py-0.5 min-w-[18px] text-center shadow-sm">
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
