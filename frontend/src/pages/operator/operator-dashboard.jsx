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
    <div className="flex flex-col h-screen bg-gradient-to-br from-[#EBF4DD] to-white">
      <Nav />
      <div className="flex flex-1 pt-[100px]"> {/* Added padding-top to account for fixed Nav */}
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
          <div className="p-8">
            <O_Routes />
          </div>
        </div>
      </div>

      <footer className="bg-gradient-to-r from-[#5A7863] via-[#90AB8B] to-[#5A7863] border-t-2 border-[#90AB8B] py-3 px-6 text-center shadow-lg">
        <p className="m-0 text-xs tracking-wide text-[#EBF4DD] font-bold max-w-4xl mx-auto">
          COPYRIGHT &copy; KOCHAS POWER PVT. LTD. - DEVELOPED BY KJTECH SOLUTIONS ALL RIGHTS RESERVED - 2025
        </p>
      </footer>
    </div>
  );
};

export default OperatorDashboard;
