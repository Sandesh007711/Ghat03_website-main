import React, { useRef, useState, useEffect } from 'react';
import { FaUser, FaCar, FaKey, FaTruckLoading, FaArrowLeft, FaArrowRight, FaChevronDown, FaList, FaEdit, FaTrashAlt } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';

// Sidebar component for navigation
const Sidebar = ({ isOpen, toggleSidebar }) => {
  // Reference for sidebar DOM element
  const sidebarRef = useRef(null);
  // State for dropdown menus
  const [isVehicalRateOpen, setIsVehicalRateOpen] = useState(false);
  const [isTokenReportOpen, setIsTokenReportOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  // Check if device is mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const handleLinkClick = () => {
    if (isMobile) {
      toggleSidebar();
    }
  };

  const handleDropdownItemClick = (setDropdownState) => {
    setDropdownState(prev => !prev);
    if (isMobile) {
      // Close sidebar only when clicking a link, not when toggling dropdown
      return;
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="relative">
      {/* Toggle button for sidebar */}
      <button
        className={`fixed top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-slate-500 via-slate-800 to-black text-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform duration-300 ease-in-out ${
          isOpen ? 'left-[17rem]' : 'left-2'
        }`}
        onClick={toggleSidebar}
      >
        {isOpen ? <FaArrowLeft /> : <FaArrowRight />}
      </button>
      {/* Main sidebar container */}
      <div ref={sidebarRef} className={`fixed top-30 left-0 h-full w-64 bg-gradient-to-b from-black via-slate-800 to-white  text-white transition-transform transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="fixed flex-col items-center justify-center h-full p-4">
          {/* Navigation menu */}
          <ul className="space-y-4">
            {/* Create User Link */}
            <li className={`flex items-center space-x-2 p-2 rounded ${isActive('/create-user') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>
              <FaUser /><Link to="/create-user" onClick={handleLinkClick}><span>Create User</span></Link>
            </li>
            {/* Vehicle Rate Dropdown */}
            <li className="flex flex-col space-y-2">
              {/* Dropdown toggle */}
              <div className="flex items-center space-x-2 p-2 rounded cursor-pointer" onClick={() => setIsVehicalRateOpen(!isVehicalRateOpen)}>
                <FaCar /><span>Vehical Rate</span><FaChevronDown className={`transform transition-transform ${isVehicalRateOpen ? 'rotate-180' : ''}`} />
              </div>
              {/* Show subsections under Vehical Rate if isVehicalRateOpen is true */}
              {isVehicalRateOpen && (
                <ul className="ml-4 space-y-2">
                  <li className={`flex items-center space-x-2 p-2 rounded ${isActive('/vehicle-rate') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>
                    <FaList /><Link to="/vehicle-rate" onClick={handleLinkClick}><span>Manage Vehical Type</span></Link>
                  </li>
                  <li className={`flex items-center space-x-2 p-2 rounded ${isActive('/manage-rate') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>
                    <FaEdit /><Link to="/manage-rate" onClick={handleLinkClick}><span>Manage Rate</span></Link>
                  </li>
                </ul>
              )}
            </li>
            {/* Token Report Dropdown */}
            <li className="flex flex-col space-y-2">
              {/* Dropdown toggle */}
              <div className="flex items-center space-x-2 p-2 rounded cursor-pointer" onClick={() => setIsTokenReportOpen(!isTokenReportOpen)}>
                <FaKey /><span>Token Report</span><FaChevronDown className={`transform transition-transform ${isTokenReportOpen ? 'rotate-180' : ''}`} />
              </div>
              {/* Show subsections under Token Report if isTokenReportOpen is true */}
              {isTokenReportOpen && (
                <ul className="ml-4 space-y-2">
                  <li className={`flex items-center space-x-2 p-2 rounded ${isActive('/token-list') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>
                    <FaList /><Link to="/token-list" onClick={handleLinkClick}><span>Token List</span></Link>
                  </li>
                  <li className={`flex items-center space-x-2 p-2 rounded ${isActive('/loaded-list') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>
                    <FaTruckLoading /><Link to="/loaded-list" onClick={handleLinkClick}><span>Loaded List</span></Link>
                  </li>
                  <li className={`flex items-center space-x-2 p-2 rounded ${isActive('/update-token-list') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>
                    <FaEdit /><Link to="/update-token-list" onClick={handleLinkClick}><span>Updated Token List</span></Link>
                  </li>
                  <li className={`flex items-center space-x-2 p-2 rounded ${isActive('/delete-token-list') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>
                    <FaTrashAlt /><Link to="/delete-token-list" onClick={handleLinkClick}><span>Deleted Token List</span></Link>
                  </li>
                </ul>
              )}
            </li>
            {/* Loaded Link */}
            <li className={`flex items-center space-x-2 p-2 rounded ${isActive('/loaded') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>
              <FaTruckLoading /><Link to="/loaded" onClick={handleLinkClick}><span>Loaded</span></Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;