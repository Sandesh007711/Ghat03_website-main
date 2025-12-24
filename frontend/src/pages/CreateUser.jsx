import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { FaEdit, FaTrash, FaTimes, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import { getUsers, createUser, updateUser, deleteUser } from '../services/api';

const CreateUser = () => {
  // Add new ref for the form container
  const formRef = useRef(null);
  
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    userName: '',
    mobileNumber: '',
    password: '',
    route: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const passwordRef = useRef(null);

  // Add new ref for username input
  const userNameInputRef = useRef(null);

  // Add new state for popups
  const [errorPopup, setErrorPopup] = useState({ show: false, message: '' });
  const [successPopup, setSuccessPopup] = useState({ show: false, message: '' });

  // Add new state for delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, index: null, id: null });

  // Add new state for API loading and error
  const [isLoading, setIsLoading] = useState(true);

  // Add new loading states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Add number validation for mobile number
    if (name === 'mobileNumber') {
      const onlyNums = value.replace(/[^0-9]/g, '');
      if (value !== onlyNums) {
        showError('Please enter numbers only');
      }
      setFormData({
        ...formData,
        [name]: onlyNums
      });
      return;
    }

    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Add popup handlers
  const showError = (message) => {
    setErrorPopup({ show: true, message });
    setTimeout(() => {
      setErrorPopup({ show: false, message: '' });
    }, 3000);
  };

  const showSuccess = (message) => {
    setSuccessPopup({ show: true, message });
    setTimeout(() => {
      setSuccessPopup({ show: false, message: '' });
    }, 3000);
  };

  // Update fetchUsers function
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const result = await getUsers();
      if (result.status === 'success' && Array.isArray(result.data)) {
        setUsers(result.data);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      showError(error.message);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Add useEffect to fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Update handleSubmit to include success messages
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.userName.trim() || !formData.mobileNumber.trim() || !formData.password.trim() || !formData.route.trim()) {
      showError('Please fill in all fields');
      return;
    }

    if (formData.mobileNumber.length !== 10) {
      showError('Mobile number must be 10 digits');
      return;
    }

    setIsSubmitting(true);
    try {
      const requestBody = {
        username: formData.userName,
        password: formData.password,
        phone: parseInt(formData.mobileNumber),
        route: formData.route
      };

      const result = isEditMode 
        ? await updateUser(users[editIndex]._id, requestBody)
        : await createUser(requestBody);

      await fetchUsers();
      showSuccess(`User ${isEditMode ? 'updated' : 'created'} successfully!`);
      
      setFormData({
        userName: '',
        mobileNumber: '',
        password: '',
        route: ''
      });
      
      if (isEditMode) {
        setIsEditMode(false);
        setEditIndex(null);
      }
    } catch (error) {
      showError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // The delete confirmation function is already correctly implemented:
  const confirmDelete = async () => {
    setIsDeletingUser(true);
    try {
      await deleteUser(deleteConfirm.id);
      await fetchUsers();
      setDeleteConfirm({ show: false, index: null, id: null });
      showSuccess('User deleted successfully!');
    } catch (error) {
      showError(error.message);
    } finally {
      setIsDeletingUser(false);
    }
  };

  // The handleDelete function that triggers the confirmation modal:
  const handleDelete = (user) => {
    setDeleteConfirm({ 
      show: true, 
      index: users.findIndex(u => u._id === user._id),
      id: user._id  // This is where we store the unique ID for deletion
    });
  };

  const handleEdit = (index) => {
    const userToEdit = users[index];
    if (!userToEdit) return;

    setFormData({
      userName: userToEdit.username || '',
      mobileNumber: userToEdit.phone?.toString() || '',
      password: userToEdit.rawPassword || '',
      route: userToEdit.route || ''
    });
    setIsEditMode(true);
    setEditIndex(index);

    // Scroll to top of the page smoothly
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

    // Focus on username input after a short delay to ensure scroll is complete
    setTimeout(() => {
      userNameInputRef.current?.focus();
    }, 500);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditIndex(null);
    setFormData({
      userName: '',
      mobileNumber: '',
      password: '',
      route: ''
    });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (passwordRef.current && !passwordRef.current.contains(event.target)) {
        setShowPassword(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [passwordRef]);

  // Update renderTableRow function
  const renderTableRow = (user, index) => (
    <tr key={user._id} className="hover:bg-gray-50 transition duration-200">
      <td className="py-3 px-4 whitespace-nowrap">{user.username}</td>
      <td className="py-3 px-4 whitespace-nowrap">{user.phone}</td>
      <td className="py-3 px-4 whitespace-nowrap">{user.rawPassword}</td>
      <td className="py-3 px-4 whitespace-nowrap">{user.route}</td>
      <td className="py-3 px-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => handleEdit(index)}
            className="w-full sm:w-auto bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-600 hover:to-yellow-400 text-white px-3 py-1 rounded-full flex items-center justify-center transition duration-300 transform hover:scale-105"
          >
            <FaEdit className="mr-1" />
            Edit
          </button>
          <button
            onClick={() => handleDelete(user)}
            className="w-full sm:w-auto bg-gradient-to-r from-red-400 to-red-600 hover:from-red-600 hover:to-red-400 text-white px-3 py-1 rounded-full flex items-center justify-center transition duration-300 transform hover:scale-105"
          >
            <FaTrash className="mr-1" />
            Delete
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="p-7 max-w-7xl mx-auto">
      {/* Error Popup */}
      {errorPopup.show && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-in-top z-50">
          <span>{errorPopup.message}</span>
          <button
            onClick={() => setErrorPopup({ show: false, message: '' })}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <FaTimes />
          </button>
        </div>
      )}

      {/* Success Popup */}
      {successPopup.show && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-in-top z-50">
          <FaCheckCircle />
          <span>{successPopup.message}</span>
          <button
            onClick={() => setSuccessPopup({ show: false, message: '' })}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <FaTimes />
          </button>
        </div>
      )}

      {/* Add Delete Confirmation Popup */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this user?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm({ show: false, index: null, id: null })}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                disabled={isDeletingUser}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors flex items-center"
                disabled={isDeletingUser}
              >
                {isDeletingUser ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Container */}
      <div ref={formRef} className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-300 mb-4">{isEditMode ? 'Edit User' : 'Create User'}</h2>
        <div className="flex flex-wrap items-center gap-4">
          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <label className="block text-gray-300 text-sm font-bold mb-2">
                  User Name
                </label>
                <div className="inline-block relative">
                  <input
                    ref={userNameInputRef}
                    type="text"
                    name="userName"
                    value={formData.userName}
                    onChange={handleInputChange}
                    placeholder="Enter user name"
                    autoComplete="off"
                    className="px-4 py-3 pr-10 bg-gray-900 text-gray-300 rounded-lg border border-gray-700 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all duration-300"
                    required
                  />
                </div>
              </div>
              <div className="relative">
                <label className="block text-gray-300 text-sm font-bold mb-2">
                  Mobile Number
                </label>
                <div className="inline-block relative">
                  <input
                    type="text"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleInputChange}
                    maxLength={10}
                    placeholder="Enter 10 digit number"
                    className="px-4 py-3 pr-10 bg-gray-900 text-gray-300 rounded-lg border border-gray-700 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all duration-300"
                    required
                  />
                </div>
              </div>
              <div className="relative" ref={passwordRef}>
                <label className="block text-gray-300 text-sm font-bold mb-2">
                  Password
                </label>
                <div className="inline-block relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter password"
                    autoComplete="new-password"
                    className="px-4 py-3 pr-10 bg-gray-900 text-gray-300 rounded-lg border border-gray-700 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all duration-300 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-200 transition-colors duration-200"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="text-lg" />
                  </button>
                </div>
              </div>
              <div className="relative">
                <label className="block text-gray-300 text-sm font-bold mb-2">
                  Route
                </label>
                <div className="inline-block relative">
                  <input
                    type="text"
                    name="route"
                    value={formData.route}
                    onChange={handleInputChange}
                    placeholder="Enter route details"
                    className="px-4 py-3 pr-10 bg-gray-900 text-gray-300 rounded-lg border border-gray-700 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all duration-300"
                    required
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-end mt-4 space-y-2 sm:space-y-0 sm:space-x-2">
              {isEditMode && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-8 py-2 rounded-md bg-gray-500 text-white font-bold transition duration-200 hover:bg-white hover:text-black border-2 border-transparent hover:border-teal-500 flex items-center justify-center"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-2 rounded-md bg-gray-500 text-white font-bold transition duration-200 hover:bg-white hover:text-black border-2 border-transparent hover:border-teal-500 flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    {isEditMode ? 'Updating...' : 'Submitting...'}
                  </>
                ) : (
                  isEditMode ? 'Update' : 'Submit'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-lg shadow-lg overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead className="bg-gradient-to-r from-slate-400 via-slate-300 to-slate-200">
            <tr>
              <th className="py-3 px-4 text-left font-semibold">User Name</th>
              <th className="py-3 px-4 text-left font-semibold">Mobile Number</th>
              <th className="py-3 px-4 text-left font-semibold">Password</th>
              <th className="py-3 px-4 text-left font-semibold">Route</th>
              <th className="py-3 px-4 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan="5" className="py-8 text-center text-gray-500 text-lg">
                  <div className="flex items-center justify-center">
                    <FaSpinner className="animate-spin text-2xl mr-2" />
                    Loading users...
                  </div>
                </td>
              </tr>
            ) : !users || users.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-8 text-center text-gray-500 text-lg">
                  No users available
                </td>
              </tr>
            ) : (
              users.map((user, index) => renderTableRow(user, index))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CreateUser;