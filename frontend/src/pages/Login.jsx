import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import loginLogo from '../assets/Login page logo.gif';
import { PiEyeClosedBold, PiEyeBold } from 'react-icons/pi';
import styled from 'styled-components';

const StyledWrapper = styled.div`
  .button {
    position: relative;
    overflow: hidden;
    height: 3rem;
    padding: 0 2rem;
    border-radius: 1.5rem;
    background: black; /* Changed background color to black */
    background-size: 400%;
    color: #fff;
    border: none;
    cursor: pointer;
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
      82.3deg,
      rgba(150, 93, 233, 1) 10.8%,
      rgba(99, 88, 238, 1) 94.3%
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
      setError(err.message || 'Login failed. Please check your credentials.');
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
      <div className="flex flex-col md:flex-row w-full max-w-6xl bg-black rounded-2xl shadow-2xl overflow-hidden">
        {/* Left side with welcome text and logo */}
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-300 to-slate-500 mb-2">
            Welcome Back!
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-slate-400 mb-6">
            {isAdminLogin ? 'Admin Portal' : 'Operator Portal'}
          </h2>
          <img src={loginLogo} alt="Login Logo" className="w-64 md:w-80 h-auto" />
        </div>
        {/* Right side with login form */}
        <div className="w-full max-w-md bg-gray-800 p-8">
          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Login form */}
          <form onKeyPress={handleKeyPress} className="space-y-6">
            {/* Phone input */}
            <div>
              <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="phone">
                Phone Number
              </label>
              <input
                className="w-full px-4 py-3 bg-gray-900 text-gray-300 rounded-lg border border-gray-700 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all duration-300"
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            {/* Password input with toggle */}
            <div>
              <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  className="w-full px-4 py-3 bg-gray-900 text-gray-300 rounded-lg border border-gray-700 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all duration-300 [&::-ms-reveal]:hidden [&::-webkit-contacts-auto-fill-button]:hidden [&::-webkit-credentials-auto-fill-button]:hidden [&::-webkit-inner-spin-button]:hidden"
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 focus:outline-none"
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
                  className="text-slate-400 hover:text-white transition-colors duration-300 text-sm font-semibold"
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