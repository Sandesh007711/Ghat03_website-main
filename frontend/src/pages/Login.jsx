import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import loginLogo from '../assets/new_logo.jpeg';
import { PiEyeClosedBold, PiEyeBold, PiWarningCircleFill, PiUserBold, PiLockBold, PiSpinnerBold } from 'react-icons/pi';

const Login = () => {
  const [isAdminLogin, setIsAdminLogin] = useState(true);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      setError('');

      const response = await loginUser({
        phone,
        password
      });

      if (response.status === 'success') {
        // Check if the user's role matches the selected login type
        if ((isAdminLogin && response.data.user.role !== 'admin') ||
          (!isAdminLogin && response.data.user.role !== 'operator')) {
          setError(`Invalid credentials for ${isAdminLogin ? 'admin' : 'operator'} login`);
          return;
        }

        // Properly structure the user data for login
        const userData = {
          ...response.data.user,
          token: response.token
        };

        login(userData);

        // Add a small delay to ensure the auth context is updated
        setTimeout(() => {
          if (response.data.user.role === 'admin') {
            navigate('/', { replace: true });
          } else if (response.data.user.role === 'operator') {
            navigate('/operator', { replace: true });
          }
        }, 100);
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      // Check if it's a deactivation error and show it prominently
      if (err.message?.includes('deactivated') || err.message?.includes('locked')) {
        setError('⚠️ ' + err.message);
      } else {
        setError(err.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchLogin = () => {
    setIsAdminLogin(!isAdminLogin);
    setPhone('');
    setPassword('');
    setError('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSignIn();
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex">

        {/* Left Side - Welcome Section */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12 bg-gradient-to-br from-[#EBF4DD]/20 to-[#90AB8B]/20 backdrop-blur-sm">
          <div className="text-center space-y-8 max-w-lg">

            {/* Welcome Text */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-[#EBF4DD] to-[#90AB8B] bg-clip-text text-transparent leading-tight">
                Welcome Back!
              </h1>
              <h2 className="text-2xl md:text-3xl font-semibold text-slate-300">
                {isAdminLogin ? 'Admin Portal' : 'Operator Portal'}
              </h2>
            </div>

            {/* Logo */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#90AB8B] via-[#5A7863] to-[#3B4953] rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
              <div className="relative">
                <div className="w-48 h-48 md:w-64 md:h-64 mx-auto bg-white rounded-full p-6 shadow-2xl transform hover:scale-105 transition-transform duration-500">
                  <img
                    src={loginLogo}
                    alt="Login Logo"
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">

            {/* Mobile Logo (visible only on small screens) */}
            <div className="lg:hidden text-center mb-8">
              <div className="w-20 h-20 mx-auto bg-white rounded-full p-1 shadow-xl mb-4">
                <img
                  src={loginLogo}
                  alt="Login Logo"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </div>

            {/* Login Card */}
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-8 transform hover:scale-[1.01] transition-transform duration-500">

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-500/10 backdrop-blur-sm border border-red-400/20 rounded-2xl animate-pulse">
                  <div className="flex items-start space-x-3">
                    <PiWarningCircleFill className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-red-200 text-sm leading-relaxed">{error}</p>
                  </div>
                </div>
              )}

              {/* Login Form */}
              <form onKeyPress={handleKeyPress} className="space-y-6">

                {/* Phone Input */}
                <div className="space-y-2">
                  <label className="block text-slate-300 text-sm font-medium" htmlFor="phone">
                    Phone Number
                  </label>
                  <div className="relative group">
                    <input
                      className="w-full px-4 py-4 bg-white/5 backdrop-blur-sm text-white rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#90AB8B]/50 focus:border-[#90AB8B]/50 transition-all duration-300 placeholder-slate-400 hover:bg-white/10"
                      id="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <label className="block text-slate-300 text-sm font-medium" htmlFor="password">
                    Password
                  </label>
                  <div className="relative group">
                    <input
                      className="w-full px-4 py-4 pr-12 bg-white/5 backdrop-blur-sm text-white rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#90AB8B]/50 focus:border-[#90AB8B]/50 transition-all duration-300 placeholder-slate-400 hover:bg-white/10"
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-[#90AB8B] focus:outline-none transition-colors duration-200"
                    >
                      {showPassword ? (
                        <PiEyeBold className="w-5 h-5" />
                      ) : (
                        <PiEyeClosedBold className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Sign In Button */}
                <button
                  type="button"
                  onClick={handleSignIn}
                  disabled={isLoading}
                  className="w-full relative overflow-hidden bg-gradient-to-r from-[#90AB8B] to-[#5A7863] hover:from-[#5A7863] hover:to-[#3B4953] text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none group"
                >
                  <span className="relative z-10 flex items-center justify-center space-x-2">
                    {isLoading ? (
                      <>
                        <PiSpinnerBold className="w-5 h-5 animate-spin" />
                        <span>Signing In...</span>
                      </>
                    ) : (
                      <span>Sign In</span>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                </button>

                {/* Switch Login Type */}
                <div className="text-center pt-4">
                  <button
                    type="button"
                    onClick={handleSwitchLogin}
                    className="text-slate-400 hover:text-white transition-colors duration-300 text-sm font-medium"
                  >
                    Switch to {isAdminLogin ? 'Operator' : 'Admin'} Login
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;