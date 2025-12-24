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
          <ul className="space-y-4 py-5">
            {/* Create User Link */}
            <li className={`flex items-center space-x-2 p-2 rounded ${isActive('/') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>
              <FaUser /><Link to="/operator"><span>Dashboard</span></Link>
            </li>
            <li className={`flex items-center space-x-2 p-2 rounded ${isActive('/print-token-report') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>
              <FaList /><Link to="/operator/print-token-report"><span>Print Token Report</span></Link>
            </li>
            <li className={`flex items-center space-x-2 p-2 rounded ${isActive('/loaded-op') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>
              <FaTruckLoading /><Link to="/operator/loaded"><span>Loaded</span></Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;