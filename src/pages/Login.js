import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaGoogle, FaMicrosoft, FaEye, FaEyeSlash } from 'react-icons/fa';

const Login = ({ login, isAuthenticated }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formFocus, setFormFocus] = useState(null);
  const [animateForm, setAnimateForm] = useState(false);

  useEffect(() => {
    // Trigger entrance animation on component mount
    setAnimateForm(true);
  }, []);

  // If already authenticated, redirect to dashboard
  if (isAuthenticated) {
    navigate('/dashboard');
  }

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    
    // Add subtle animation to the form field being changed
    setFormFocus(name);
    setTimeout(() => setFormFocus(null), 300);
    
    setFormData({
      ...formData,
      [name]: name === 'rememberMe' ? checked : value
    });

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate email
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      // Shake form on error
      const formElement = document.getElementById('loginForm');
      formElement.classList.add('animate-shake');
      setTimeout(() => {
        formElement.classList.remove('animate-shake');
      }, 500);
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API login request
      await new Promise(resolve => setTimeout(resolve, 1000));

      // In a real app, you would call your authentication API here

      // Call login function from props to update authentication state
      login();

      // Redirect to dashboard after successful login
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setErrors({
        form: 'Login failed. Please check your credentials and try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSSOLogin = (provider) => {
    setIsLoading(true);

    // Simulate SSO login
    setTimeout(() => {
      // In a real app, this would redirect to the provider's oauth page
      login();
      navigate('/dashboard');
    }, 1500);
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-[calc(100vh-64px)]">
      <div className={`max-w-md mx-auto py-12 px-4 sm:px-6 lg:px-8 transition-all duration-700 ease-in-out ${animateForm ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="bg-white shadow-elevation-3 rounded-lg overflow-hidden transform transition-all duration-500 hover:shadow-elevation-4">
          <div className="p-6 sm:p-8 bg-gradient-to-br from-white to-gray-50">
            <div className="text-center mb-8 transform transition-all duration-500">
              <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-500">Welcome back</h2>
              <p className="mt-2 text-sm text-gray-600">
                Log in to your Campus Cycle account
              </p>
            </div>

            {errors.form && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm animate-fade-in-up">
                {errors.form}
              </div>
            )}

            <form id="loginForm" onSubmit={handleSubmit} className="space-y-6">
              <div className={`transition-all duration-300 transform ${formFocus === 'email' ? 'scale-[1.02]' : 'scale-100'}`}>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1 relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="h-5 w-5 text-gray-400 group-hover:text-primary-500 transition-colors duration-200" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2 border ${
                      errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300 group-hover:border-primary-400'
                    } rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all duration-300`}
                    placeholder="name@university.edu"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 animate-fade-in-up">{errors.email}</p>
                )}
              </div>

              <div className={`transition-all duration-300 transform ${formFocus === 'password' ? 'scale-[1.02]' : 'scale-100'}`}>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-400 group-hover:text-primary-500 transition-colors duration-200" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-10 py-2 border ${
                      errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300 group-hover:border-primary-400'
                    } rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all duration-300`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors duration-200" />
                    ) : (
                      <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors duration-200" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600 animate-fade-in-up">{errors.password}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="rememberMe"
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded transition-all duration-300"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>

                <Link to="/forgot-password" className="text-sm font-medium text-primary-600 hover:text-primary-500 transition-all duration-300 underline-offset-2 hover:underline">
                  Forgot your password?
                </Link>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Logging in...
                    </>
                  ) : (
                    'Sign in'
                  )}
                </button>
              </div>
            </form>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleSSOLogin('google')}
                  className="w-full inline-flex justify-center py-2.5 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <FaGoogle className="h-5 w-5 text-red-500" />
                  <span className="ml-2">Google</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSSOLogin('microsoft')}
                  className="w-full inline-flex justify-center py-2.5 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <FaMicrosoft className="h-5 w-5 text-blue-500" />
                  <span className="ml-2">Microsoft</span>
                </button>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 sm:px-8">
            <p className="text-sm text-center text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500 transition-all duration-300 underline-offset-2 hover:underline">
                Sign up now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;