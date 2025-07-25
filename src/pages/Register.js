import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaUniversity, FaGoogle, FaMicrosoft, FaEye, FaEyeSlash, FaCheckCircle } from 'react-icons/fa';
import ApiService from '../services/api';

const Register = ({ login, isAuthenticated }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    university: '',
    agreeToTerms: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
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

  // Calculate password strength
  useEffect(() => {
    if (!formData.password) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;
    // Length check
    if (formData.password.length >= 8) strength += 25;
    // Contains lowercase
    if (/[a-z]/.test(formData.password)) strength += 25;
    // Contains uppercase
    if (/[A-Z]/.test(formData.password)) strength += 25;
    // Contains number or special char
    if (/[0-9!@#$%^&*(),.?":{}|<>]/.test(formData.password)) strength += 25;

    setPasswordStrength(strength);
  }, [formData.password]);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    
    // Add subtle animation to the form field being changed
    setFormFocus(name);
    setTimeout(() => setFormFocus(null), 300);
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
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
    
    // Validate name
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    // Validate email
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    } else if (!formData.email.endsWith('@uclan.ac.uk')) {
      newErrors.email = 'Please use your UCLan email address (@uclan.ac.uk)';
    }
    
    // Validate university
    if (!formData.university) {
      newErrors.university = 'Please select your university';
    }
    
    // Validate password
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    // Validate confirm password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    // Terms agreement
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Shake form on error
      const formElement = document.getElementById('registerForm');
      formElement.classList.add('animate-shake');
      setTimeout(() => {
        formElement.classList.remove('animate-shake');
      }, 500);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const registrationData = {
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        university: formData.university
      };

      const response = await ApiService.register(registrationData);
      
      // Set the auth token
      ApiService.setAuthToken(response.token);
      
      // Store user data
      localStorage.setItem('campus_cycle_user', JSON.stringify(response.user));
      
      // Call login function from props to update authentication state
      login(response.user);

      // Show success message
      alert('Registration successful! Welcome to Campus Cycle!');

      // Redirect to dashboard after successful registration
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({
        form: error.message || 'Registration failed. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSSOLogin = (provider) => {
    setIsLoading(true);
    // TODO: Implement actual SSO integration
    setTimeout(() => {
      setIsLoading(false);
      // For now, show that SSO is not yet implemented
      setErrors({
        form: `${provider} sign-up will be available soon.`
      });
    }, 1000);
  };

  // Password strength indicator label
  const getPasswordStrengthLabel = () => {
    if (!formData.password) return '';
    if (passwordStrength <= 25) return 'Weak';
    if (passwordStrength <= 50) return 'Fair';
    if (passwordStrength <= 75) return 'Good';
    return 'Strong';
  };

  // Password strength color
  const getPasswordStrengthColor = () => {
    if (!formData.password) return 'bg-gray-200';
    if (passwordStrength <= 25) return 'bg-red-500';
    if (passwordStrength <= 50) return 'bg-yellow-500';
    if (passwordStrength <= 75) return 'bg-blue-500';
    return 'bg-green-500';
  };

  // Mock university list
  const universities = [
    "Select your university",
    "University of California, Berkeley",
    "Stanford University",
    "Massachusetts Institute of Technology",
    "Harvard University",
    "University of Michigan",
    "University of Texas at Austin",
    "New York University",
    "University of Chicago",
    "University of Washington",
    "Other"
  ];

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-[calc(100vh-64px)]">
      <div className={`max-w-md mx-auto py-12 px-4 sm:px-6 lg:px-8 transition-all duration-700 ease-in-out ${animateForm ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="bg-white shadow-elevation-3 rounded-lg overflow-hidden transform transition-all duration-500 hover:shadow-elevation-4">
          <div className="p-6 sm:p-8 bg-gradient-to-br from-white to-gray-50">
            <div className="text-center mb-8 transform transition-all duration-500">
              <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-500">Create an account</h2>
              <p className="mt-2 text-sm text-gray-600">
                Join the Campus Cycle community
              </p>
            </div>
            
            {errors.form && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm animate-fade-in-up">
                {errors.form}
              </div>
            )}
            
            <form id="registerForm" onSubmit={handleSubmit} className="space-y-6">
              <div className={`transition-all duration-300 transform ${formFocus === 'fullName' ? 'scale-[1.02]' : 'scale-100'}`}>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <div className="mt-1 relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="h-5 w-5 text-gray-400 group-hover:text-primary-500 transition-colors duration-200" />
                  </div>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2 border ${
                      errors.fullName ? 'border-red-300 bg-red-50' : 'border-gray-300 group-hover:border-primary-400'
                    } rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all duration-300`}
                    placeholder="John Doe"
                  />
                  {formData.fullName && !errors.fullName && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <FaCheckCircle className="h-5 w-5 text-green-500 animate-scale-in" />
                    </div>
                  )}
                </div>
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-600 animate-fade-in-up">{errors.fullName}</p>
                )}
              </div>

              <div className={`transition-all duration-300 transform ${formFocus === 'email' ? 'scale-[1.02]' : 'scale-100'}`}>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  University Email
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
                    placeholder="student@uclan.ac.uk"
                  />
                  {formData.email && !errors.email && formData.email.endsWith('@uclan.ac.uk') && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <FaCheckCircle className="h-5 w-5 text-green-500 animate-scale-in" />
                    </div>
                  )}
                  {formData.email && !formData.email.endsWith('@uclan.ac.uk') && formData.email.length > 0 && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-red-500 text-xs">UCLan only</span>
                    </div>
                  )}
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 animate-fade-in-up">{errors.email}</p>
                )}
                <p className="mt-1 text-sm text-blue-600">🎓 Registration is only available for UCLan students</p>
              </div>

              <div className={`transition-all duration-300 transform ${formFocus === 'university' ? 'scale-[1.02]' : 'scale-100'}`}>
                <label htmlFor="university" className="block text-sm font-medium text-gray-700">
                  University
                </label>
                <div className="mt-1 relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUniversity className="h-5 w-5 text-gray-400 group-hover:text-primary-500 transition-colors duration-200" />
                  </div>
                  <select
                    id="university"
                    name="university"
                    value={formData.university}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-8 py-2 border ${
                      errors.university ? 'border-red-300 bg-red-50' : 'border-gray-300 group-hover:border-primary-400'
                    } rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all duration-300 appearance-none`}
                  >
                    {universities.map((uni, index) => (
                      <option key={index} value={index === 0 ? '' : uni}>
                        {uni}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                {errors.university && (
                  <p className="mt-1 text-sm text-red-600 animate-fade-in-up">{errors.university}</p>
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
                    autoComplete="new-password"
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
                
                {formData.password && (
                  <div className="mt-1.5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="h-2 flex-1 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${getPasswordStrengthColor()} transition-all duration-500 ease-in-out`} 
                          style={{ width: `${passwordStrength}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-xs font-medium text-gray-500">{getPasswordStrengthLabel()}</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Password must be at least 8 characters long
                    </p>
                  </div>
                )}
              </div>

              <div className={`transition-all duration-300 transform ${formFocus === 'confirmPassword' ? 'scale-[1.02]' : 'scale-100'}`}>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <div className="mt-1 relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-400 group-hover:text-primary-500 transition-colors duration-200" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-10 py-2 border ${
                      errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300 group-hover:border-primary-400'
                    } rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all duration-300`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors duration-200" />
                    ) : (
                      <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors duration-200" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600 animate-fade-in-up">{errors.confirmPassword}</p>
                )}
                {formData.confirmPassword && formData.password === formData.confirmPassword && !errors.confirmPassword && (
                  <p className="mt-1 text-sm text-green-600 flex items-center">
                    <FaCheckCircle className="mr-1 h-4 w-4" /> Passwords match
                  </p>
                )}
              </div>

              <div className="flex items-start group">
                <div className="flex items-center h-5">
                  <input
                    id="agreeToTerms"
                    name="agreeToTerms"
                    type="checkbox"
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                    className={`h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded transition-all duration-300 cursor-pointer group-hover:border-primary-400`}
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="agreeToTerms" className={`font-medium ${errors.agreeToTerms ? 'text-red-600' : 'text-gray-700'} cursor-pointer`}>
                    I agree to the{' '}
                    <Link to="/terms" className="text-primary-600 hover:text-primary-500 transition-all duration-300 underline-offset-2 hover:underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-primary-600 hover:text-primary-500 transition-all duration-300 underline-offset-2 hover:underline">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
              </div>
              {errors.agreeToTerms && (
                <p className="text-sm text-red-600 animate-fade-in-up -mt-4">{errors.agreeToTerms}</p>
              )}

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
                      Creating account...
                    </>
                  ) : (
                    'Create Account'
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
                  <span className="px-2 bg-white text-gray-500">Or sign up with</span>
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
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500 transition-all duration-300 underline-offset-2 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;