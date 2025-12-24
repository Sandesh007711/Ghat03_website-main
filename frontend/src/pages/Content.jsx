import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import { FaCheckCircle, FaTimes } from 'react-icons/fa';
import { StyledButton } from '../components/StyledButton';
import { getUsers, getVehicleRates, createToken } from '../services/api';

// Main Content component that displays operators and their details
const Content = () => {
  // State management for operators, selected operator, and loading status
  const [operators, setOperators] = useState([]);
  const [selectedOperator, setSelectedOperator] = useState(null);
  const [loading, setLoading] = useState(true);

  // Add new state for form handling
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    driverName: '',
    driverMobile: '',
    vehicleNo: '',
    vehicleType: '',
    vehicleId: '', // Add this line
    vehicleRate: '',
    quantity: '',
    place: '',
    chalaanPin: '',
    route: '',
    userId: ''  // Add this line
  });
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [tempFormData, setTempFormData] = useState(null);
  const [successPopup, setSuccessPopup] = useState({ show: false, message: '' });
  const [errorPopup, setErrorPopup] = useState({ show: false, message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add form-related constants
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [users, setUsers] = useState([]);

  // Modify generateQuantityOptions to only include predefined values
  const generateQuantityOptions = () => {
//20/02/25
    
    const options = ["Select Quantity", "0"];
    for (let i = 50; i <= 1000; i += 50) {
      options.push(i.toString());
    }
    return options;
  };

  const quantityOptions = generateQuantityOptions();

  // Update handleInputChange for quantity
  const handleInputChange = (e) => {
    const { name, value } = e.target;
//20/02/25
    // Special handling for quantity field
    if (name === 'quantity') {
      if (value === 'Select Quantity') {
        setFormData(prev => ({ ...prev, quantity: '' }));
        return;
      }
      // Ensure empty string and zero are handled properly
      const numValue = value === '' ? '' : Number(value);
      if (!isNaN(numValue)) {
        setFormData(prev => ({
          ...prev,
          quantity: numValue.toString()
        }));
      }
      return;
    }

    if (name === 'vehicleType') {
      if (value === '') {
        setFormData(prev => ({
          ...prev,
          vehicleType: '',
          vehicleId: '',
          vehicleRate: ''
        }));
        return;
      }
      
      const selectedVehicleData = vehicleTypes.find(type => type.vehicleId === value);
      
      if (selectedVehicleData) {
        setFormData(prev => ({
          ...prev,
          vehicleType: selectedVehicleData.vehicleType,
          vehicleId: selectedVehicleData.vehicleId,
          vehicleRate: selectedVehicleData.rate.toString()
        }));
      }
      return;
    }

    if (name === 'vehicleRate' && value === 'Select Rate') return;
    if (name === 'quantity' && value === 'Select Quantity') return;

    if (name === 'driverMobile') {
      const onlyNums = value.replace(/[^0-9]/g, '');
      if (onlyNums !== value) {
        showError('Please enter numbers only for mobile number');
      }
      setFormData(prev => ({
        ...prev,
        [name]: onlyNums.slice(0, 10)
      }));
      return;
    }

    if (name === 'driverName' || name === 'vehicleNo' || name === 'place' || name === 'chalaanPin') {
      setFormData(prev => ({
        ...prev,
        [name]: value.toUpperCase()
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const showError = (message) => {
    setErrorPopup({ show: true, message });
    setTimeout(() => setErrorPopup({ show: false, message: '' }), 3000);
  };

  const showSuccess = (message) => {
    setSuccessPopup({ show: true, message });
    setTimeout(() => setSuccessPopup({ show: false, message: '' }), 3000);
  };

  // Update handleSubmitClick validation
  const handleSubmitClick = async (e) => {
    e.preventDefault();
    
    try {
      // Basic validations
      if (!formData.driverName.trim()) {
        showError('Driver Name is required');
        return;
      }
  
      if (!formData.vehicleId) {
        showError('Please select a vehicle type');
        return;
      }
  
      // Prepare the data first
      const submitData = {
        userId: formData.userId,
        driverName: formData.driverName.trim(),
        driverMobileNo: parseInt(formData.driverMobile),
        vehicleNo: formData.vehicleNo.trim(),
        vehicleId: formData.vehicleId,
        quantity: formData.quantity === "0" ? 0 : Number(formData.quantity), // Handle zero explicitly
        place: formData.place.trim() || undefined,
        challanPin: formData.chalaanPin || undefined,
        route: formData.route
      };
  
      // Clean undefined values
      Object.keys(submitData).forEach(key => 
        submitData[key] === undefined && delete submitData[key]
      );
  
      // Now validate all required fields
      const requiredFields = ['userId', 'driverName', 'driverMobileNo', 'vehicleNo', 'vehicleId', 'route'];
      const missingFields = requiredFields.filter(field => !submitData[field]);
      
      // Special check for quantity that allows zero
      if (submitData.quantity === undefined || submitData.quantity === '' || isNaN(submitData.quantity)) {
        missingFields.push('quantity');
      }
  
      if (missingFields.length > 0) {
        throw new Error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      }

      console.log('Submitting data:', submitData); // For debugging

      const result = await createToken(submitData);

      if (result.status === 'success') {
        showSuccess('Token generated successfully!');
        setIsModalOpen(false);
        setFormData({
          driverName: '',
          driverMobile: '',
          vehicleNo: '',
          vehicleType: '',
          vehicleId: '',
          vehicleRate: '',
          quantity: '',
          place: '',
          chalaanPin: '',
          route: '',
          userId: ''
        });
      } else {
        throw new Error(result.message || 'Failed to generate token');
      }
    } catch (error) {
      console.error('Error submitting token:', error);
      showError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update fetchOperators to handle the new format
  useEffect(() => {
    const fetchOperators = async () => {
      setLoading(true);
      try {
        const result = await getUsers();
        if (result.status === 'success' && result.data) {
          // Just filter operators and set them directly, maintaining original structure
          const operatorData = result.data.filter(user => user.role === 'operator');
          setOperators(operatorData);
        }
      } catch (error) {
        console.error('Error fetching operators:', error);
        showError('Failed to fetch operators');
      } finally {
        setLoading(false);
      }
    };

    fetchOperators();
  }, []);

  // Add new useEffect for fetching vehicle types
  useEffect(() => {
    const fetchVehicleTypes = async () => {
      try {
        const result = await getVehicleRates();
        if (result.status === 'success' && result.data && result.data.rates) {
          setVehicleTypes(result.data.rates);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error('Error fetching vehicle types:', error);
        showError(error.message);
      }
    };

    fetchVehicleTypes();
  }, []);

  // Update fetchRoutes to handle the new format
  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const result = await getUsers();
        if (result.status === 'success' && result.data) {
          // Extract unique routes from users
          const uniqueRoutes = [...new Set(
            result.data
              .filter(user => user.route && user.role === 'operator')
              .map(user => user.route)
          )];
          
          setRoutes(uniqueRoutes.map(route => ({ route })));
        }
      } catch (error) {
        console.error('Error fetching routes:', error);
        showError(error.message);
      }
    };

    fetchRoutes();
  }, []);

  // Update fetchUsers to handle the new format
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const result = await getUsers();
        if (result.status === 'success' && result.data) {
          // Map users data to required format
          const formattedUsers = result.data
            .filter(user => user.role === 'operator')
            .map(user => ({
              _id: user._id,
              username: user.username,
              route: user.route,
              role: user.role
            }));
          
          setUsers(formattedUsers);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        showError(error.message);
      }
    };

    fetchUsers();
  }, []);

  // Update handleCardClick to pass the complete operator data
  const handleCardClick = (operator) => {
    setSelectedOperator(prev => 
      prev?._id === operator._id ? null : operator
    );
  };

  // Render component based on loading and selection state
  return (
    <div className="p-7 max-w-7xl mx-auto">
      {/* Success and Error Popups */}
      {successPopup.show && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-in-top z-50">
          <FaCheckCircle />
          <span>{successPopup.message}</span>
          <button onClick={() => setSuccessPopup({ show: false, message: '' })}><FaTimes /></button>
        </div>
      )}

      {errorPopup.show && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-in-top z-50">
          <span>{errorPopup.message}</span>
          <button onClick={() => setErrorPopup({ show: false, message: '' })}><FaTimes /></button>
        </div>
      )}

      {/* Add Print Token Button */}
      <StyledButton onClick={() => setIsModalOpen(true)}>
        Add Print Token
      </StyledButton>

      {/* Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center pt-20 z-50">
          <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-6 w-[800px] max-h-[85vh] overflow-y-auto relative">
            {/* Close button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <FaTimes className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-bold text-gray-300 mb-4">Add New Token</h2>
            <form onSubmit={handleSubmitClick} autoComplete="off">
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-gray-300 text-sm font-bold mb-2">Select User</label>
                  <select
                    name="userId"
                    value={formData.userId}
                    onChange={handleInputChange}
                    className="px-4 py-3 w-full bg-gray-900 text-gray-300 rounded-lg border border-gray-700 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all duration-300"
                    required
                  >
                    <option value="">Select User</option>
                    {Array.isArray(users) && users
                      .filter(user => user.role === 'operator') // Only show operators in the dropdown
                      .map((user) => (
                        <option key={user._id} value={user._id}>
                          {user.username} - {user.route}
                        </option>
                    ))}
                  </select>
                </div>
                <div className="relative">
                  <label className="block text-gray-300 text-sm font-bold mb-2">Driver Name</label>
                  <input 
                    type="text" 
                    name="driverName"
                    value={formData.driverName}
                    onChange={handleInputChange}
                    className="px-4 py-3 w-full bg-gray-900 text-gray-300 rounded-lg border border-gray-700 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all duration-300"
                    required
                  />
                </div>
                <div className="relative">
                  <label className="block text-gray-300 text-sm font-bold mb-2">Driver Mobile</label>
                  <input 
                    type="tel" 
                    name="driverMobile"
                    value={formData.driverMobile}
                    onChange={handleInputChange}
                    maxLength={10}
                    className="px-4 py-3 w-full bg-gray-900 text-gray-300 rounded-lg border border-gray-700 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all duration-300"
                    required
                  />
                </div>
                <div className="relative">
                  <label className="block text-gray-300 text-sm font-bold mb-2">Vehicle No</label>
                  <input 
                    type="text" 
                    name="vehicleNo"
                    value={formData.vehicleNo}
                    onChange={handleInputChange}
                    className="px-4 py-3 w-full bg-gray-900 text-gray-300 rounded-lg border border-gray-700 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all duration-300"
                    required
                  />
                </div>
                <div className="relative">
                  <label className="block text-gray-300 text-sm font-bold mb-2">Vehicle Type</label>
                  <select
                    name="vehicleType"
                    value={formData.vehicleId || ''} // Change to use vehicleId
                    onChange={handleInputChange}
                    className="px-4 py-3 w-full bg-gray-900 text-gray-300 rounded-lg border border-gray-700 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all duration-300"
                    required
                  >
                    <option value="">Select Vehicle Type</option>
                    {Array.isArray(vehicleTypes) && vehicleTypes.map((type) => (
                      <option key={type.vehicleId} value={type.vehicleId}>
                        {type.vehicleType} - ₹{type.rate}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Replace Vehicle Rate dropdown with read-only input */}
                <div className="relative">
                  <label className="block text-gray-300 text-sm font-bold mb-2">Vehicle Rate</label>
                  <input 
                    type="text"
                    name="vehicleRate"
                    value={formData.vehicleRate ? `₹${formData.vehicleRate}` : ''}
                    className="px-4 py-3 w-full bg-gray-900 text-gray-300 rounded-lg border border-gray-700 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all duration-300"
                    readOnly
                    required
                  />
                </div>
                <div className="relative">
                  <label className="block text-gray-300 text-sm font-bold mb-2">Quantity</label>
                  {formData.quantity === "0" ? (
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      min="0"
                      className="px-4 py-3 w-full bg-gray-900 text-gray-300 rounded-lg border border-gray-700 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all duration-300"
                      required
                    />
                  ) : (
                    <select
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      className="px-4 py-3 w-full bg-gray-900 text-gray-300 rounded-lg border border-gray-700 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all duration-300"
                      required
                    >
                      {quantityOptions.map((qty, index) => (
                        <option key={index} value={qty}>{qty}</option>
                      ))}
                    </select>
                  )}
                </div>
                <div className="relative">
                  <label className="block text-gray-300 text-sm font-bold mb-2">Route</label>
                  <select
                    name="route"
                    value={formData.route}
                    onChange={handleInputChange}
                    className="px-4 py-3 w-full bg-gray-900 text-gray-300 rounded-lg border border-gray-700 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all duration-300"
                    required
                  >
                    <option value="">Select Route</option>
                    {Array.isArray(routes) && routes.map((route, index) => (
                      <option key={index} value={route.route}>
                        {route.route}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="relative">
                  <label className="block text-gray-300 text-sm font-bold mb-2">Place</label>
                  <input 
                    type="text" 
                    name="place"
                    value={formData.place}
                    onChange={handleInputChange}
                    className="px-4 py-3 w-full bg-gray-900 text-gray-300 rounded-lg border border-gray-700 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all duration-300"
                  />
                </div>
                <div className="relative">
                  <label className="block text-gray-300 text-sm font-bold mb-2">Chalaan Pin</label>
                  <input 
                    type="text" 
                    name="chalaanPin"
                    value={formData.chalaanPin}
                    onChange={handleInputChange}
                    className="px-4 py-3 w-full bg-gray-900 text-gray-300 rounded-lg border border-gray-700 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all duration-300"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center min-w-[100px]"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  ) : (
                    'Submit'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Show loading spinner when data is being fetched */}
      {loading ? (
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      ) : !selectedOperator ? (
        // Grid layout for operator cards when no operator is selected
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mt-8">
          {/* Map through operators and create cards */}
          {operators.map((op) => (
            <div
              key={op._id}
              onClick={() => handleCardClick(op)}
              className="cursor-pointer transform transition-transform duration-300 hover:scale-105"
            >
              <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 hover:shadow-xl hover:bg-slate-200">
                <div className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-800">
                  Operator {op.username}
                </div>
                <div className="text-sm sm:text-base text-gray-600">
                  <p className="mb-2">Total Tokens: {op.tokenData?.totalTokens || 0}</p>
                  <p className="mb-2">Daily Tokens: {op.tokenData?.dailyTokens?.count || 0}</p>
                  <p className="mb-2">Route: {op.route || 'N/A'}</p>
                  <p>Latest Activity: {op.tokenData?.dailyTokens?.date ? 
                    new Date(op.tokenData.dailyTokens.date).toLocaleDateString() : 
                    'No activity'}</p>
                </div>
                <div className="mt-3 sm:mt-4 text-blue-500 text-xs sm:text-sm">Click to view details →</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Show detailed view when an operator is selected
        <div className="w-full max-w-4xl mx-auto">
          {/* Back button */}
          <button
            onClick={() => setSelectedOperator(null)}
            className="mb-4 bg-gray-500 hover:bg-gray-700 text-white font-bold py-1.5 sm:py-2 px-3 sm:px-4 my-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105 text-sm sm:text-base"
          >
            ← Back to Operators
          </button>
          {/* Render Card component with selected operator data */}
          <Card operator={selectedOperator} />
        </div>
      )}
    </div>
  );
};

export default Content;
