import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toggleDarkMode } from '../Slices/themeSlice';
import useOnClickOutside from '../hooks/useOnClickOutside';

const sidebarItems = [
  { id: 'overview', label: 'Overview', icon: 'home' },
  { id: 'pdfs', label: 'PDFs', icon: 'file' },
  // { id: 'projects', label: 'Projects', icon: 'folder' },
  { id: 'tasks', label: 'Tasks', icon: 'check-square' },
  { id: 'calendar', label: 'Calendar', icon: 'calendar' },
  { id: 'messages', label: 'Messages', icon: 'message-circle' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
];

const Dashboard = () => {
  const isDarkMode = useSelector(state => state.theme.darkMode);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isAnimating, setIsAnimating] = useState(false); 
  const {token}=useSelector((state)=>state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const toggleButtonRef = useRef(null);

  useEffect(()=>{
    if(!token){
        navigate("/login")
      }
  },[token,navigate])

 
  const currentPath = location.pathname.split('/').pop();
  const [activeItem, setActiveItem] = useState(currentPath || 'overview');

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 2000);
    }, 8000);
    
    return () => clearInterval(interval);
  }, []);

  useOnClickOutside(sidebarRef, (event) => {
    if (sidebarOpen && toggleButtonRef.current && !toggleButtonRef.current.contains(event.target)) {
      setSidebarOpen(false);
    }
  });

  const toggleSidebar = () => {
    setSidebarOpen(prevState => !prevState);
  };

  const handleItemClick = (itemId) => {
    setActiveItem(itemId);
    navigate(`/dashboard/${itemId}`);
    
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const handleToggleDarkMode = () => {
    dispatch(toggleDarkMode());
  };

  
  const renderIcon = (iconName) => {
    switch (iconName) {
      case 'home':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        );
      case 'folder':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
          </svg>
        );
      case 'check-square':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 11 12 14 22 4"></polyline>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
          </svg>
        );
      case 'calendar':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        );
      case 'message-circle':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
          </svg>
        );
      case 'settings':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
        );
      case 'file':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
    
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 z-0">
          <div className="stars-container">
            {[...Array(200)].map((_, i) => (
              <div 
                key={i} 
                className="star"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 8}s`,
                  width: `${Math.random() * 3 + (i % 20 === 0 ? 3 : 1)}px`,
                  height: `${Math.random() * 3 + (i % 20 === 0 ? 3 : 1)}px`,
                  opacity: `${Math.random() * 0.8 + 0.2}`
                }}
              />
            ))}
          </div>
          
       
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-gradient-radial from-blue-500/20 to-transparent rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-radial from-purple-500/20 to-transparent rounded-full transform translate-x-1/4 translate-y-1/4"></div>
          </div>
        </div>
      </div>
      
   
      <button 
        ref={toggleButtonRef}
        onClick={toggleSidebar}
        className={`md:hidden fixed bottom-6 left-6 z-50 p-3 rounded-full shadow-lg transition-all duration-300 ${
          isDarkMode 
            ? 'bg-blue-600 text-white hover:bg-blue-700' 
            : 'bg-white text-blue-600 hover:bg-gray-100'
        } ${sidebarOpen ? 'rotate-90' : ''}`}
      >
        {sidebarOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>
     

      <div className="flex flex-1 relative z-10 pt-16">
   
        <aside 
          ref={sidebarRef}
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0 fixed md:relative inset-y-0 left-0 z-20 w-64 transition-transform duration-300 ease-in-out ${
            isDarkMode ? 'bg-gray-800/60 backdrop-blur-sm' : 'bg-white/90 backdrop-blur-sm'
          } shadow-lg overflow-hidden pt-16 md:pt-0`}
        >
          <div className={`absolute inset-y-0 left-0 w-1 ${isDarkMode ? 'bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500' : 'bg-blue-500'}`}></div>
          
          <nav className="mt-6 px-4">
            <ul className="space-y-2">
              {sidebarItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => handleItemClick(item.id)}
                    className={`flex items-center w-full px-4 py-3 rounded-lg transition-all duration-200 ${
                      activeItem === item.id
                        ? isDarkMode
                          ? 'bg-blue-900/30 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.5)]'
                          : 'bg-blue-100 text-blue-700'
                        : isDarkMode
                        ? 'text-gray-300 hover:bg-gray-700/50'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className={`mr-3 ${activeItem === item.id && isDarkMode ? 'text-blue-400' : ''}`}>
                      {renderIcon(item.icon)}
                    </span>
                    <span>{item.label}</span>
                    {activeItem === item.id && (
                      <span className="ml-auto">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
        
       
        <div 
          className={`fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden transition-opacity duration-300 ${
            sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setSidebarOpen(false)}
        ></div>
       
      
        <main 
          className={`flex-1 p-6 transition-all duration-300 z-50 ${
            isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50/50'
          } ${sidebarOpen ? 'md:ml-0' : 'ml-0'}`}
          style={{
            width: '100%',
            position: 'relative'
          }}
        >
          <div className={`bg-opacity-90 rounded-lg shadow-lg p-6 ${
            isDarkMode 
              ? 'bg-gray-800/60 backdrop-blur-sm border border-gray-700/50' 
              : 'bg-white/90 backdrop-blur-sm'
          }`}>
            
            {/* Dashboard header - sticky with higher z-index to stay on top */}
            <div 
              className="mb-6 sticky top-0 z-50 pb-2" 
              style={{ 
                backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.6)' : 'rgba(255, 255, 255, 0.9)', 
                backdropFilter: 'blur(8px)',
                borderRadius: '0.375rem',
                marginTop: '-1.5rem',
                marginLeft: '-1.5rem',
                marginRight: '-1.5rem',
                padding: '1.5rem',
                paddingBottom: '0.5rem'
              }}
            >
              <h2 className={`text-2xl font-bold mb-2 animate-text-gradient bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent`}>
                {location.pathname.includes('/dashboard/') 
                  ? sidebarItems.find(item => item.id === activeItem)?.label || 'Dashboard'
                  : 'Welcome to your Dashboard'}
              </h2>
              
              {location.pathname.includes('/dashboard/') && (
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Manage your {sidebarItems.find(item => item.id === activeItem)?.label.toLowerCase() || 'dashboard'}
                </p>
              )}
            </div>
            

            {location.pathname.includes('/dashboard/') && (
              <div className="w-full max-w-full overflow-x-hidden mt-4 relative z-10">
                <Outlet />
              </div>
            )}
            
       
            {!location.pathname.includes('/dashboard/') && (
              <>
                <p className={`mb-8 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Select an item from the sidebar to get started
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                  {sidebarItems.slice(0, 3).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(item.id)}
                      className={`p-6 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                        isDarkMode 
                          ? 'bg-gray-700/70 hover:bg-gray-600/70 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
                          : 'bg-white hover:bg-blue-50'
                      }`}
                    >
                      <div className="flex items-center mb-4">
                        <span className={`p-2 rounded-full ${
                          isDarkMode 
                            ? 'bg-blue-900/30 text-blue-400' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {renderIcon(item.icon)}
                        </span>
                        <h3 className={`ml-3 text-lg font-semibold ${
                          isDarkMode 
                            ? 'text-white' 
                            : 'text-gray-900'
                        }`}>
                          {item.label}
                        </h3>
                      </div>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Click to view your {item.label.toLowerCase()}
                      </p>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;