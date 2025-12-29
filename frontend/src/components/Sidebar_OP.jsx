import React, { useRef, useState } from 'react';
import { FaUser, FaCar, FaKey, FaTruckLoading, FaArrowLeft, FaArrowRight, FaChevronDown, FaList, FaEdit, FaTrashAlt } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';

// Sidebar component for navigation
const Sidebar = ({ isOpen, toggleSidebar }) => {
  // Reference for sidebar DOM element
  const sidebarRef = useRef(null);
  // State for dropdown menus

  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="relative">
      {/* Toggle button for sidebar */}
      <button
        className={`fixed top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-[#90AB8B] via-[#5A7863] to-[#3B4953] text-[#EBF4DD] p-3 rounded-full shadow-lg hover:scale-110 hover:shadow-xl transition-all duration-300 ease-in-out ${
          isOpen ? 'left-[17rem]' : 'left-2'
        }`}
        onClick={toggleSidebar}
      >
        {isOpen ? <FaArrowLeft /> : <FaArrowRight />}
      </button>
      {/* Main sidebar container */}
      <div ref={sidebarRef} className={`fixed top-30 left-0 h-full w-64 bg-gradient-to-b from-[#5A7863] via-[#90AB8B] to-[#EBF4DD] text-black shadow-2xl transition-transform transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="fixed flex-col items-center justify-center h-full p-4">
          {/* Navigation menu */}
          <ul className="space-y-4 py-5">
            {/* Create User Link */}
            <li className={`flex items-center space-x-3 p-3 rounded-lg font-semibold transition-all duration-300 ${isActive('/operator') ? 'bg-[#EBF4DD] text-black shadow-md scale-105' : 'hover:bg-white/20 backdrop-blur-sm hover:scale-105'}`}>
              <FaUser className="text-xl" /><Link to="/operator"><span>Dashboard</span></Link>
            </li>
            <li className={`flex items-center space-x-3 p-3 rounded-lg font-semibold transition-all duration-300 ${isActive('/operator/print-token-report') ? 'bg-[#EBF4DD] text-black shadow-md scale-105' : 'hover:bg-white/20 backdrop-blur-sm hover:scale-105'}`}>
              <FaList className="text-xl" /><Link to="/operator/print-token-report"><span>Print Token Report</span></Link>
            </li>
            <li className={`flex items-center space-x-3 p-3 rounded-lg font-semibold transition-all duration-300 ${isActive('/operator/loaded') ? 'bg-[#EBF4DD] text-black shadow-md scale-105' : 'hover:bg-white/20 backdrop-blur-sm hover:scale-105'}`}>
              <FaTruckLoading className="text-xl" /><Link to="/operator/loaded"><span>Loaded</span></Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;