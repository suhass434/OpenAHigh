import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { FileSearch, BookOpen, Moon, Sun } from 'lucide-react';
import { logout } from '../../services/operations/authAPI';
import { toggleDarkMode } from '../../Slices/themeSlice';

const Navbar = () => {
  const { token } = useSelector((state) => state.auth);
  const isDarkMode = useSelector(state => state.theme.darkMode);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout(navigate));
  };

  return (
    <div className={`fixed top-0 z-50 w-full ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border-b`}>
      <div className="px-3 py-3 lg:px-5 lg:pl-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-start">
            <Link to="/" className="flex items-center ml-2 md:mr-24">
              <div className="relative flex items-center">
                <FileSearch className={`h-8 w-8 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                <BookOpen className={`h-8 w-8 -ml-3 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
              </div>
              <span className={`ml-2 text-xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-800'} font-sans`}>
                CrawlShastra
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => dispatch(toggleDarkMode())}
              className={`p-2 rounded-lg ${
                isDarkMode
                  ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
            
            {!token ? (
              <div className="flex items-center gap-4">
                <Link
                  to="/login"
                  className={`text-sm font-medium ${
                    isDarkMode 
                      ? 'text-gray-300 hover:text-white' 
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className={`text-sm font-medium px-4 py-2 rounded-lg ${
                    isDarkMode
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  Sign Up
                </Link>
              </div>
            ) : (
              <button
                onClick={handleLogout}
                className={`text-sm font-medium px-4 py-2 rounded-lg ${
                  isDarkMode
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;