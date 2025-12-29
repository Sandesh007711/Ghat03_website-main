import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { FaEdit, FaTrash, FaTimes, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import { getUsers, createUser, updateUser, deleteUser, activateUser, deactivateUser } from '../services/api';

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

  // Add new state for toggle confirmation
  const [toggleConfirm, setToggleConfirm] = useState({ show: false, user: null });

  // Add new state for API loading and error
  const [isLoading, setIsLoading] = useState(true);

  // Add new loading states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [togglingUserId, setTogglingUserId] = useState(null);

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

  const handleToggleActive = async (user) => {
    setToggleConfirm({ show: true, user });
  };

  const confirmToggleActive = async () => {
    const user = toggleConfirm.user;
    setTogglingUserId(user._id);
    setToggleConfirm({ show: false, user: null });
    
    try {
      if (user.active) {
        await deactivateUser(user._id);
        showSuccess('User locked successfully!');
      } else {
        await activateUser(user._id);
        showSuccess('User unlocked successfully!');
      }
      await fetchUsers();
    } catch (error) {
      showError(error.message || 'Failed to update user status');
    } finally {
      setTogglingUserId(null);
    }
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
    <tr key={user._id} className="bg-[#EBF4DD] hover:bg-[#90AB8B] transition duration-200">
      <td className="py-3 px-4 whitespace-nowrap text-[#3B4953]">{user.username}</td>
      <td className="py-3 px-4 whitespace-nowrap text-[#3B4953]">{user.phone}</td>
      <td className="py-3 px-4 whitespace-nowrap text-[#3B4953]">{user.rawPassword}</td>
      <td className="py-3 px-4 whitespace-nowrap text-[#3B4953]">{user.route}</td>
      <td className="py-3 px-4">
        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
          <div className="flex gap-2">
            <button
              onClick={() => handleEdit(index)}
              className="bg-gradient-to-r from-[#90AB8B] to-[#5A7863] hover:from-[#5A7863] hover:to-[#3B4953] text-[#EBF4DD] px-3 py-1 rounded-full flex items-center justify-center transition duration-300 transform hover:scale-105"
            >
              <FaEdit className="mr-1" />
              Edit
            </button>
            <button
              onClick={() => handleDelete(user)}
              className="bg-gradient-to-r from-red-400 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-3 py-1 rounded-full flex items-center justify-center transition duration-300 transform hover:scale-105"
            >
              <FaTrash className="mr-1" />
              Delete
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${user.active ? 'text-green-600' : 'text-red-600'}`}>
              {togglingUserId === user._id ? (
                <span className="flex items-center">
                  <FaSpinner className="animate-spin mr-1" />
                  {user.active ? 'Locking...' : 'Unlocking...'}
                </span>
              ) : (
                user.active ? 'Unlocked' : 'Locked'
              )}
            </span>
            <button
              onClick={() => handleToggleActive(user)}
              disabled={togglingUserId === user._id}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5A7863] ${
                user.active ? 'bg-green-500' : 'bg-gray-300'
              } ${togglingUserId === user._id ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {togglingUserId === user._id ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <FaSpinner className="animate-spin text-white text-sm" />
                </div>
              ) : (
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    user.active ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              )}
            </button>
          </div>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="p-7 max-w-7xl mx-auto pb-24">
      {/* Error Popup */}
      {errorPopup.show && (
        <div className="fixed top-4 right-4 bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 text-red-800 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-in-top z-50">
          <span className="font-medium">{errorPopup.message}</span>
          <button
            onClick={() => setErrorPopup({ show: false, message: '' })}
            className="text-red-600 hover:text-red-800 transition-colors"
          >
            <FaTimes />
          </button>
        </div>
      )}

      {/* Success Popup */}
      {successPopup.show && (
        <div className="fixed top-4 right-4 bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-500 text-green-800 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-in-top z-50">
          <FaCheckCircle />
          <span className="font-medium">{successPopup.message}</span>
          <button
            onClick={() => setSuccessPopup({ show: false, message: '' })}
            className="text-green-600 hover:text-green-800 transition-colors"
          >
            <FaTimes />
          </button>
        </div>
      )}

      {/* Add Delete Confirmation Popup */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-[#EBF4DD] to-white rounded-lg shadow-2xl p-6 max-w-sm w-full mx-4 border-2 border-[#90AB8B]">
            <h2 className="text-xl font-bold mb-4 text-[#3B4953]">Confirm Delete</h2>
            <p className="text-[#5A7863] mb-6">Are you sure you want to delete this user?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm({ show: false, index: null, id: null })}
                className="px-4 py-2 bg-[#EBF4DD] text-[#5A7863] rounded hover:bg-white hover:text-[#3B4953] transition-colors border-2 border-[#90AB8B]"
                disabled={isDeletingUser}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded hover:from-red-600 hover:to-red-700 transition-all flex items-center"
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

      {/* Add Toggle Status Confirmation Popup */}
      {toggleConfirm.show && toggleConfirm.user && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-[#EBF4DD] to-white rounded-lg shadow-2xl p-6 max-w-sm w-full mx-4 border-2 border-[#90AB8B]">
            <h2 className="text-xl font-bold mb-4 text-[#3B4953]">Confirm Status Change</h2>
            <p className="text-[#5A7863] mb-6">
              Are you sure you want to {toggleConfirm.user.active ? 'lock' : 'unlock'} this user?
              {toggleConfirm.user.active && (
                <span className="block mt-2 text-red-600 font-semibold">
                  The user will be logged out immediately and won't be able to login until unlocked.
                </span>
              )}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setToggleConfirm({ show: false, user: null })}
                className="px-4 py-2 bg-[#EBF4DD] text-[#5A7863] rounded hover:bg-white hover:text-[#3B4953] transition-colors border-2 border-[#90AB8B]"
              >
                Cancel
              </button>
              <button
                onClick={confirmToggleActive}
                className={`px-4 py-2 text-white rounded transition-all flex items-center ${
                  toggleConfirm.user.active 
                    ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700' 
                    : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                }`}
              >
                {toggleConfirm.user.active ? 'Lock' : 'Unlock'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Container */}
      <div ref={formRef} className="bg-gradient-to-r from-[#5A7863] via-[#90AB8B] to-[#5A7863] rounded-2xl shadow-2xl p-6 mb-6">
        <h2 className="text-2xl font-bold text-[#EBF4DD] mb-4">{isEditMode ? 'Edit User' : 'Create User'}</h2>
        <div className="flex flex-wrap items-center gap-4">
          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <label className="block text-[#EBF4DD] text-sm font-bold mb-2">
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
                    className="px-4 py-3 pr-10 bg-[#EBF4DD] text-[#3B4953] rounded-lg border-2 border-[#90AB8B] focus:outline-none focus:border-[#5A7863] focus:ring-2 focus:ring-[#5A7863] transition-all duration-300"
                    required
                  />
                </div>
              </div>
              <div className="relative">
                <label className="block text-[#EBF4DD] text-sm font-bold mb-2">
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
                    className="px-4 py-3 pr-10 bg-[#EBF4DD] text-[#3B4953] rounded-lg border-2 border-[#90AB8B] focus:outline-none focus:border-[#5A7863] focus:ring-2 focus:ring-[#5A7863] transition-all duration-300"
                    required
                  />
                </div>
              </div>
              <div className="relative" ref={passwordRef}>
                <label className="block text-[#EBF4DD] text-sm font-bold mb-2">
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
                    className="px-4 py-3 pr-10 bg-[#EBF4DD] text-[#3B4953] rounded-lg border-2 border-[#90AB8B] focus:outline-none focus:border-[#5A7863] focus:ring-2 focus:ring-[#5A7863] transition-all duration-300 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-3 flex items-center text-[#5A7863] hover:text-[#3B4953] transition-colors duration-200"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="text-lg" />
                  </button>
                </div>
              </div>
              <div className="relative">
                <label className="block text-[#EBF4DD] text-sm font-bold mb-2">
                  Route
                </label>
                <div className="inline-block relative">
                  <input
                    type="text"
                    name="route"
                    value={formData.route}
                    onChange={handleInputChange}
                    placeholder="Enter route details"
                    className="px-4 py-3 pr-10 bg-[#EBF4DD] text-[#3B4953] rounded-lg border-2 border-[#90AB8B] focus:outline-none focus:border-[#5A7863] focus:ring-2 focus:ring-[#5A7863] transition-all duration-300"
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
                  className="px-8 py-2 rounded-md bg-gradient-to-r from-[#5A7863] to-[#3B4953] text-[#EBF4DD] font-bold transition duration-200 hover:from-[#3B4953] hover:to-[#5A7863] flex items-center justify-center"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-2 rounded-md bg-[#EBF4DD] text-[#3B4953] font-bold transition duration-200 hover:bg-white hover:shadow-lg border-2 border-transparent hover:border-[#3B4953] flex items-center justify-center"
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
      <div className="bg-white rounded-lg shadow-lg overflow-x-auto border-2 border-[#5A7863]">
        <table className="w-full min-w-[640px]">
          <thead className="bg-[#5A7863] text-[#EBF4DD]">
            <tr>
              <th className="py-3 px-4 text-left font-semibold">User Name</th>
              <th className="py-3 px-4 text-left font-semibold">Mobile Number</th>
              <th className="py-3 px-4 text-left font-semibold">Password</th>
              <th className="py-3 px-4 text-left font-semibold">Route</th>
              <th className="py-3 px-4 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#90AB8B]">
            {isLoading ? (
              <tr>
                <td colSpan="5" className="py-8 text-center text-[#5A7863] text-lg">
                  <div className="flex items-center justify-center">
                    <FaSpinner className="animate-spin text-2xl mr-2" />
                    <span className="font-medium">Loading users...</span>
                  </div>
                </td>
              </tr>
            ) : !users || users.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-8 text-center text-[#5A7863] text-lg">
                  <span className="font-medium">No users available</span>
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