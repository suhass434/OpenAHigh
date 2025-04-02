import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toggleDarkMode } from '../../Slices/themeSlice'
import { FaMoon, FaSun } from 'react-icons/fa'
import { logout } from '../../services/operations/authAPI'

const Navbar = () => {
  const {pathname}=useLocation();
  const navigate=useNavigate();
  const dispatch = useDispatch();
  const isDarkMode = useSelector(state => state.theme.darkMode);
  const [isAnimating, setIsAnimating] = useState(false);
  const token=useSelector(state=>state.auth.token);


  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 2000);
    }, 8000);
    
    return () => clearInterval(interval);
  }, []);

  const handleToggleDarkMode = () => {
    dispatch(toggleDarkMode());
  };

  return (
   
<div>
<nav className={`fixed w-full z-20 top-0 start-0 border-b transition-all duration-300 ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
 
  <div 
    className={`absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 ${isAnimating ? 'animate-shine' : ''}`} 
    style={{ transform: 'skewX(-20deg)', transformOrigin: 'top left' }}
  />
  
 
  {isDarkMode && (
    <div className="absolute inset-0 overflow-hidden opacity-30">
      <div className="stars-container">
        {[...Array(20)].map((_, i) => (
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
  )}
  
  <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4 relative">
  <Link to="/" className="flex items-center space-x-3 rtl:space-x-reverse">
      <div className="relative overflow-hidden rounded-full w-8 h-8 flex items-center justify-center">
        <div className={`absolute inset-0 ${isDarkMode ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gradient-to-r from-blue-500 to-purple-500'} opacity-80`}></div>
        <span className="relative text-white font-bold">O</span>
      </div>
      <span className={`self-center text-2xl font-semibold whitespace-nowrap animate-text-gradient bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent`}>OpenAHigh</span>
  </Link>
  <div className="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
    <div className='flex items-center gap-3'>
    
      <button 
        type="button" 
        onClick={handleToggleDarkMode}
        className={`relative overflow-hidden text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 rounded-lg text-sm p-2.5 transition-all duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}
        aria-label="Toggle dark mode"
      >
        {isDarkMode ? (
          <FaSun className="w-5 h-5 text-yellow-300" />
        ) : (
          <FaMoon className="w-5 h-5 text-blue-700" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 hover:opacity-10 transition-opacity duration-300"></div>
      </button>
      {token ? (
        <button 
          type="button" 
          onClick={() => dispatch(logout(navigate))} 
          className={`relative overflow-hidden text-white font-medium rounded-lg text-sm px-4 py-2 text-center focus:outline-none focus:ring-2 focus:ring-offset-2 transform transition-all duration-300 hover:scale-105 hover:shadow-lg ${isDarkMode ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:ring-blue-500' : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'}`}
        >
          Logout
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 hover:opacity-10 transition-opacity duration-300"></div>
        </button>
      ) : (
      <>
      <button 
        type="button" 
        onClick={()=>navigate("/login")} 
        className={`relative overflow-hidden text-white font-medium rounded-lg text-sm px-4 py-2 text-center focus:outline-none focus:ring-2 focus:ring-offset-2 transform transition-all duration-300 hover:scale-105 hover:shadow-lg ${isDarkMode ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:ring-blue-500' : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'}`}
      >
        Login
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 hover:opacity-10 transition-opacity duration-300"></div>
      </button>

      <button 
        type="button" 
        onClick={()=>navigate("/signup")}  
        className={`relative overflow-hidden text-white font-medium rounded-lg text-sm px-4 py-2 text-center focus:outline-none focus:ring-2 focus:ring-offset-2 transform transition-all duration-300 hover:scale-105 hover:shadow-lg ${isDarkMode ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:ring-purple-500' : 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500'}`}
      >
        Signup
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 hover:opacity-10 transition-opacity duration-300"></div>
      </button>
      </>
      )
    }

    </div>
      <button data-collapse-toggle="navbar-sticky" type="button" className={`inline-flex items-center p-2 w-10 h-10 justify-center text-sm rounded-lg md:hidden focus:outline-none focus:ring-2 ml-2 ${isDarkMode ? 'text-gray-400 hover:bg-gray-700 focus:ring-gray-600' : 'text-gray-500 hover:bg-gray-100 focus:ring-gray-200'}`} aria-controls="navbar-sticky" aria-expanded="false">
        <span className="sr-only">Open main menu</span>
        <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15"/>
        </svg>
    </button>
  </div>
  <div className={`items-center justify-between hidden w-full md:flex md:w-auto md:order-1 transition-all duration-300`} id="navbar-sticky">
    <ul className={`flex flex-col p-4 md:p-0 mt-4 font-medium rounded-lg md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 ${isDarkMode ? 'bg-gray-800 border-gray-700 md:bg-gray-900' : 'bg-white border-gray-100 md:bg-white'}`}>
      <li>
        <Link to="/" className={`relative block py-2 px-3 rounded-md md:bg-transparent md:p-0 transition-all duration-300 overflow-hidden ${pathname==="/"? 
          (isDarkMode ? 'text-blue-400 md:text-blue-400' : 'text-blue-700 md:text-blue-700') : 
          (isDarkMode ? 'text-white hover:bg-gray-700 hover:text-blue-300 md:hover:bg-transparent' : 'text-gray-900 hover:bg-gray-100 hover:text-blue-600 md:hover:bg-transparent')}`}
        >
          Home
          {pathname === "/" && (
            <span className={`absolute bottom-0 left-0 w-full h-0.5 ${isDarkMode ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-gradient-to-r from-blue-600 to-purple-600'} transform transition-transform duration-300`}></span>
          )}
        </Link>
      </li>
      <li>
        <Link to="/about" className={`relative block py-2 px-3 rounded-md md:bg-transparent md:p-0 transition-all duration-300 overflow-hidden ${pathname==="/about"? 
          (isDarkMode ? 'text-blue-400 md:text-blue-400' : 'text-blue-700 md:text-blue-700') : 
          (isDarkMode ? 'text-white hover:bg-gray-700 hover:text-blue-300 md:hover:bg-transparent' : 'text-gray-900 hover:bg-gray-100 hover:text-blue-600 md:hover:bg-transparent')}`}
        >
          About
          {pathname === "/about" && (
            <span className={`absolute bottom-0 left-0 w-full h-0.5 ${isDarkMode ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-gradient-to-r from-blue-600 to-purple-600'} transform transition-transform duration-300`}></span>
          )}
        </Link>
      </li>
      <li>
        <Link to="/services" className={`relative block py-2 px-3 rounded-md md:bg-transparent md:p-0 transition-all duration-300 overflow-hidden ${pathname==="/services"? 
          (isDarkMode ? 'text-blue-400 md:text-blue-400' : 'text-blue-700 md:text-blue-700') : 
          (isDarkMode ? 'text-white hover:bg-gray-700 hover:text-blue-300 md:hover:bg-transparent' : 'text-gray-900 hover:bg-gray-100 hover:text-blue-600 md:hover:bg-transparent')}`}
        >
          Services
          {pathname === "/services" && (
            <span className={`absolute bottom-0 left-0 w-full h-0.5 ${isDarkMode ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-gradient-to-r from-blue-600 to-purple-600'} transform transition-transform duration-300`}></span>
          )}
        </Link>
      </li>
    </ul>
  </div>
  </div>
</nav>
</div>
  )
}

export default Navbar