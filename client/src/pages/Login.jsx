import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import SakuraEffect from '../components/SakuraEffect';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      toast.success('Đăng nhập thành công!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <SakuraEffect />
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-violet-700 via-primary-600 to-purple-700 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl" style={{ animation: 'float 6s ease-in-out infinite' }} />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-violet-400/10 rounded-full blur-3xl" style={{ animation: 'float 6s ease-in-out infinite', animationDelay: '-3s' }} />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-300/10 rounded-full blur-3xl" style={{ animation: 'pulse-glow 3s ease-in-out infinite' }} />
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }} />
        </div>

        <div className="absolute top-32 right-20 w-20 h-20 border-2 border-white/10 rounded-2xl rotate-12" style={{ animation: 'float 6s ease-in-out infinite' }} />
        <div className="absolute bottom-40 left-20 w-16 h-16 border-2 border-white/10 rounded-full" style={{ animation: 'float 6s ease-in-out infinite', animationDelay: '-2s' }} />
        <div className="absolute top-1/2 right-1/4 w-12 h-12 bg-white/5 rounded-xl -rotate-12" style={{ animation: 'float 6s ease-in-out infinite', animationDelay: '-4s' }} />

        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-2xl shadow-violet-900/30">
              <span className="text-primary-500 font-extrabold text-3xl">T</span>
            </div>
            <div>
              <h1 className="text-white text-4xl font-extrabold tracking-tight">TeamUp</h1>
              <p className="text-violet-200 text-sm mt-0.5">Nền tảng quản lý dự án</p>
            </div>
          </div>

          <h2 className="text-white text-3xl font-bold leading-tight mb-4">
            Quản lý nhóm &amp; dự án<br />
            <span className="text-violet-200">một cách hiệu quả</span>
          </h2>

          <p className="text-violet-200 text-lg max-w-md mb-10 leading-relaxed">
            Cộng tác với đồng đội, theo dõi tiến độ công việc và đánh giá peer review dễ dàng.
          </p>

          <div className="flex gap-8">
            {[{ value: '500+', label: 'Người dùng' }, { value: '1K+', label: 'Nhóm hoạt động' }, { value: '99%', label: 'Hài lòng' }].map((stat) => (
              <div key={stat.label}>
                <p className="text-white text-2xl font-extrabold">{stat.value}</p>
                <p className="text-violet-300 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50/50">
        <div className="w-full max-w-md" style={{ animation: 'slide-up 0.5s ease-out forwards' }}>
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-600/30">
              <span className="text-white font-extrabold text-xl">T</span>
            </div>
            <span className="text-2xl font-extrabold text-gray-900">TeamUp</span>
          </div>

          <div className="bg-white rounded-3xl shadow-soft-lg p-8 sm:p-10 border border-gray-100">
            <div className="mb-8">
              <h2 className="text-2xl font-extrabold text-gray-900">Chào mừng trở lại</h2>
              <p className="text-gray-500 mt-2">Đăng nhập vào tài khoản của bạn</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field pl-12"
                    placeholder="email@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Mật khẩu</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pl-12 pr-12"
                    placeholder="Nhập mật khẩu"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3.5 text-base mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Đang đăng nhập...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Đăng nhập
                  </span>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-gray-500">
                Chưa có tài khoản?{' '}
                <button
                  onClick={() => navigate('/register')}
                  className="text-primary-600 font-semibold hover:text-primary-700 transition-colors"
                >
                  Đăng ký ngay
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
