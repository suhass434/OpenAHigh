import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { signUp ,sendOtp} from '../services/operations/authAPI';

const OTP = () => {
  const [otp, setOtp] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isDarkMode = useSelector(state => state.theme.darkMode);
 

  const signupData = useSelector(state => state?.auth?.signupData);
  console.log(signupData)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 2000);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!otp) {

      console.log("Please enter OTP");
      return;
    }
    
    try {
      const {
        username,
        email,
        password,
        confirmPassword
      } = signupData;
      console.log(signupData)
      await dispatch(
        signUp(
         username,
          email,
          password,
          confirmPassword,
          otp,
          navigate
        )
      );
    } catch (error) {
      console.log("OTP Verification Error:", error);
    }
  };

  return (
    <div className={`min-h-screen flex justify-center items-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 z-0">
       
          <div className="stars-container">
            {[...Array(100)].map((_, i) => (
              <div 
                key={i} 
                className="star"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  width: `${Math.random() * 2 + 1}px`,
                  height: `${Math.random() * 2 + 1}px`
                }}
              />
            ))}
          </div>
        </div>
      </div>
      
      <div className={`max-w-md w-full mx-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg overflow-hidden shadow-xl transform transition-all relative z-10`}>
        <div 
          className={`absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 ${isAnimating ? 'animate-shine' : ''}`} 
          style={{ transform: 'skewX(-20deg)', transformOrigin: 'top left' }}
        />
        
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="inline-block">
              <svg className="w-16 h-16 mx-auto" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path 
                  d="M12 15V17M6 21H18C19.1046 21 20 20.1046 20 19V13C20 11.8954 19.1046 11 18 11H6C4.89543 11 4 11.8954 4 13V19C4 20.1046 4.89543 21 6 21ZM16 11V7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7V11H16Z" 
                  stroke={isDarkMode ? '#60A5FA' : '#3B82F6'} 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h2 className={`mt-6 text-3xl font-extrabold ${isDarkMode ? 'text-white' : 'text-gray-900'} animate-text-gradient bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent`}>
              Verify Your Email
            </h2>
            <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              We've sent a verification code to {signupData.email || 'your email'}
            </p>
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="otp" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Verification Code
              </label>
              <div className="mt-1">
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className={`appearance-none block w-full px-3 py-2 border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' : 'border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-500'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300`}
                  placeholder="Enter verification code"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${isDarkMode ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform transition-all duration-300 hover:scale-105 hover:shadow-lg`}
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <svg className="h-5 w-5 text-blue-300 group-hover:text-blue-200" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </span>
                Verify
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Didn't receive the code?{' '}
              <button 
                type="button" 
                className={`font-medium ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'} transition-colors duration-300`}
                onClick={() => {
                  dispatch(sendOtp(signupData?.email, navigate))
                }}
              >
                Resend
              </button>
            </p>
          </div>
          
          <div className="mt-4 text-center">
            <Link 
              to="/signup" 
              className={`text-sm font-medium ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'} transition-colors duration-300`}
            >
              Back to Signup
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTP;