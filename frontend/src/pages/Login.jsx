import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import loginLogo from '../assets/new_logo.jpeg';
import { PiEyeClosedBold, PiEyeBold, PiWarningCircleFill } from 'react-icons/pi';
import styled from 'styled-components';

const StyledWrapper = styled.div`
  .button {
    position: relative;
    overflow: hidden;
    height: 3rem;
    padding: 0 2rem;
    border-radius: 1.5rem;
    background: linear-gradient(135deg, #90AB8B 0%, #5A7863 100%);
    background-size: 400%;
    color: #EBF4DD;
    border: none;
    cursor: pointer;
    font-weight: 600;
    box-shadow: 0 4px 15px rgba(90, 120, 99, 0.3);
    transition: all 0.3s ease;
  }

  .button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(90, 120, 99, 0.4);
  }

  .button:hover::before {
    transform: scaleX(1);
  }

  .button-content {
    position: relative;
    z-index: 1;
  }

  .button::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    transform: scaleX(0);
    transform-origin: 0 50%;
    width: 100%;
    height: inherit;
    border-radius: inherit;
    background: linear-gradient(
      135deg,
      #5A7863 0%,
      #3B4953 100%
    );
    transition: all 0.475s;
  }
`;

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#EBF4DD] via-[#90AB8B] to-[#5A7863] p-4">
      <div className="flex flex-col md:flex-row w-full max-w-6xl bg-gradient-to-br from-[#EBF4DD] to-[#90AB8B] rounded-2xl shadow-2xl overflow-hidden border-2 border-[#5A7863]">
        {/* Left side with welcome text and logo */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-br from-[#EBF4DD] to-[#90AB8B]">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#5A7863] to-[#3B4953] mb-2">
            Welcome Back!
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-[#3B4953] mb-6">
            {isAdminLogin ? 'Admin Portal' : 'Operator Portal'}
          </h2>
          <div className="bg-white p-6 rounded-full shadow-xl border-4 border-[#5A7863]">
            <img 
              src={loginLogo} 
              alt="Login Logo" 
              className="w-48 h-48 md:w-64 md:h-64 rounded-full object-cover" 
            />
          </div>
        </div>
        {/* Right side with login form */}
        <div className="w-full max-w-md bg-gradient-to-br from-[#90AB8B] to-[#5A7863] p-8">
          {/* Error message */}
          {error && (
            <div className="mb-4 p-4 bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 rounded-lg shadow-lg animate-shake">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <PiWarningCircleFill className="h-6 w-6 text-red-500" />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-red-800 text-sm font-semibold leading-relaxed">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Login form */}
          <form onKeyPress={handleKeyPress} className="space-y-6">
            {/* Phone input */}
            <div>
              <label className="block text-[#EBF4DD] text-sm font-bold mb-2" htmlFor="phone">
                Phone Number
              </label>
              <input
                className="w-full px-4 py-3 bg-[#EBF4DD] text-[#3B4953] rounded-lg border-2 border-[#5A7863] focus:outline-none focus:border-[#3B4953] focus:ring-2 focus:ring-[#90AB8B] transition-all duration-300 placeholder-[#5A7863]"
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            {/* Password input with toggle */}
            <div>
              <label className="block text-[#EBF4DD] text-sm font-bold mb-2" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  className="w-full px-4 py-3 bg-[#EBF4DD] text-[#3B4953] rounded-lg border-2 border-[#5A7863] focus:outline-none focus:border-[#3B4953] focus:ring-2 focus:ring-[#90AB8B] transition-all duration-300 placeholder-[#5A7863] [&::-ms-reveal]:hidden [&::-webkit-contacts-auto-fill-button]:hidden [&::-webkit-credentials-auto-fill-button]:hidden [&::-webkit-inner-spin-button]:hidden"
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3B4953] hover:text-[#5A7863] focus:outline-none transition-colors duration-200"
                >
                  {showPassword ? (
                    <PiEyeBold className="w-5 h-5" />
                  ) : (
                    <PiEyeClosedBold className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Buttons */}
            <StyledWrapper>
              <div className="flex flex-col space-y-4">
                <button
                  type="button"
                  onClick={handleSignIn}
                  disabled={isLoading}
                  className="button"
                >
                  <span className="button-content">
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleSwitchLogin}
                  className="text-[#EBF4DD] hover:text-[#3B4953] transition-colors duration-300 text-sm font-semibold underline decoration-[#EBF4DD]"
                >
                  Switch to {isAdminLogin ? 'Operator Login' : 'Admin Login'}
                </button>
              </div>
            </StyledWrapper>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;