import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar_OP';
import Nav from '../../components/Nav_Op';
import O_Routes from '../../routes/O_Routes';

const OperatorDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Nav />
      <div className="flex flex-1 pt-[100px]"> {/* Added padding-top to account for fixed Nav */}
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
          <div className="p-8">
            <O_Routes />
          </div>
        </div>
      </div>

      <footer className="footer_w">
      <p className="m-0 text-xs tracking-wide opacity-75">
        COPYRIGHT &copy; RAMJEE SINGH AND COMPANY - DEVELOPED BY VASHUDEV ALL RIGHTS RESERVED - 2025
      </p>
    </footer>
    </div>
  );
};

export default OperatorDashboard;
