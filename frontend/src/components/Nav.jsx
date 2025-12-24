import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from 'styled-components';
import logo from "../assets/logo.png";
import home from "../assets/home.png";
import { logoutUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { BiSolidContact } from 'react-icons/bi';
import { IoMdClose } from 'react-icons/io';
import { BsBuilding } from 'react-icons/bs';
import { FaPhoneAlt } from 'react-icons/fa';

const StyledWrapper = styled.div`
  .Btn {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: 45px;
    height: 45px;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition-duration: .3s;
    box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.199);
    background-color: rgb(255, 65, 65);
  }

  .sign {
    width: 100%;
    transition-duration: .3s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .sign svg {
    width: 17px;
  }

  .sign svg path {
    fill: white;
  }

  .text {
    position: absolute;
    right: 0%;
    width: 0%;
    opacity: 0;
    color: white;
    font-size: 1.2em;
    font-weight: 600;
    transition-duration: .3s;
  }

  .Btn:hover {
    width: 125px;
    border-radius: 40px;
    transition-duration: .3s;
  }

  .Btn:hover .sign {
    width: 30%;
    transition-duration: .3s;
    padding-left: 20px;
  }

  .Btn:hover .text {
    opacity: 1;
    width: 70%;
    transition-duration: .3s;
    padding-right: 10px;
  }

  .Btn:active {
    transform: translate(2px ,2px);
  }
`;

const Nav = () => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = async () => {
    try {
      await logoutUser();
      logout(); // Clear auth context
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Logout locally anyway
      logout();
      navigate('/login');
    } finally {
      setShowLogoutConfirm(false);
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <>
      <header className="fixed top-0 w-full z-50 bg-gradient-to-l from-slate-400 via-slate-700 to-black py-2 sm:py-3 md:py-3 lg:py-4">
        <div className="flex justify-between items-center mx-2 sm:mx-3 md:mx-4 lg:mx-5">
          {/* Company Logo and Title */}
          <div className="flex items-center gap-2">
            <img
              src={logo}
              alt="Ramjee Singh & Co Logo"
              className="h-[60px] w-[60px] sm:h-[70px] sm:w-[70px] md:h-[80px] md:w-[80px] lg:h-[90px] lg:w-[90px] rounded-full"
            />
          
            <Link to="/" className="ml-2 sm:ml-3 md:ml-4 lg:ml-5">
              <h1 className="text-white text-sm sm:text-xl md:text-2xl lg:text-3xl font-bold rounded-xl px-2 transition-transform duration-300 hover:scale-110 hover:shadow-lg hover:shadow-slate-400">
                Ramjee Singh And Co.
              </h1>
            </Link>
          </div>

          {/* Menu Items */}
          <div className="flex items-center gap-4 sm:gap-6 md:gap-8 lg:gap-10">
            <Link to="/">
              <button className="transition-transform duration-300 hover:scale-110 group">
                <img
                  src={home}
                  alt="Home"
                  className="h-[25px] w-[25px] sm:h-[30px] sm:w-[30px] md:h-[40px] md:w-[40px]"
                />
                <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Home
                </span>
              </button>
            </Link>

            <button
              onClick={() => setShowContactModal(true)}
              className="transition-transform duration-300 hover:scale-110 group"
            >
              <BiSolidContact className="text-3xl text-white hover:text-blue-400 transition-colors" />
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Contact Us
              </span>
            </button>

            <StyledWrapper>
              <button className="Btn" onClick={handleLogoutClick}>
                <div className="sign">
                  <svg viewBox="0 0 512 512">
                    <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z" />
                  </svg>
                </div>
                <div className="text">Logout</div>
              </button>
            </StyledWrapper>
          </div>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Confirm Logout</h2>
            <p className="mb-6 text-gray-600">Are you sure you want to logout?</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleLogoutCancel}
                className="px-4 py-2 bg-gray-200 text-gray-800 hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogoutConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <BiSolidContact className="text-4xl text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-800">Contact Us</h2>
              </div>
              <button
                onClick={() => setShowContactModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <IoMdClose className="text-2xl" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <BsBuilding className="text-2xl text-blue-600" />
                  <h3 className="font-semibold text-gray-800 text-xl">Company</h3>
                </div>
                <p className="text-gray-700 text-lg font-medium pl-9">Vashudev</p>
              </div>
              
              <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <FaPhoneAlt className="text-2xl text-blue-600" />
                  <h3 className="font-semibold text-gray-800 text-xl">Contact Numbers</h3>
                </div>
                <div className="space-y-3 pl-9">
                  <p className="text-gray-700 hover:text-blue-600 transition-colors cursor-pointer flex items-center gap-2">
                    <span className="font-medium">+91 6239135898</span>
                  </p>
                  <p className="text-gray-700 hover:text-blue-600 transition-colors cursor-pointer flex items-center gap-2">
                    <span className="font-medium">+91 7644027325</span>
                  </p>
                  <p className="text-gray-700 hover:text-blue-600 transition-colors cursor-pointer flex items-center gap-2">
                    <span className="font-medium">+91 9508694942</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Nav;


