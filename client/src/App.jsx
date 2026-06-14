import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import GroupList from './pages/GroupList';
import GroupDetail from './pages/GroupDetail';
import TaskDetail from './pages/TaskDetail';
import MyTasks from './pages/MyTasks';
import PeerReview from './pages/PeerReview';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import CreateGroup from './pages/CreateGroup';
import Layout from './components/Layout';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
            
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="groups" element={<GroupList />} />
              <Route path="groups/create" element={<CreateGroup />} />
              <Route path="groups/:groupId" element={<GroupDetail />} />
              <Route path="tasks" element={<MyTasks />} />
              <Route path="tasks/:taskId" element={<TaskDetail />} />
              <Route path="peer-review/:groupId" element={<PeerReview />} />
              <Route path="reports/:groupId" element={<Reports />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="profile" element={<Profile />} />
            </Route>
          </Routes>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#1e293b',
                color: '#f1f5f9',
                borderRadius: '12px',
                fontWeight: '500',
                fontSize: '14px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                border: '1px solid rgba(255,255,255,0.05)',
              },
              success: {
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#f1f5f9',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#f1f5f9',
                },
              },
            }}
          />
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
