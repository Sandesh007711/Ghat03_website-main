import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaTimes, FaCheckCircle, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';
import { getVehicles, getVehicleRates, updateVehicleRate, deleteVehicleRate, createVehicleRate } from '../../services/api';

/**
 * ManageRate Component
 * Handles the management of vehicle rates including adding, editing, and deleting rates
 * Features: Vehicle type selection, rate input with validation, and tabular display of rates
 */
const ManageRate = () => {
  // State Management
  const [selectedVehicle, setSelectedVehicle] = useState('');  // Selected vehicle from dropdown
  const [rate, setRate] = useState('');                        // Rate input value
  const [rates, setRates] = useState([]);                      // List of all vehicle rates
  const [editingId, setEditingId] = useState(null);           // ID of rate being edited
  const [inputError, setInputError] = useState('');           // Error message for validation
  const [errorPopup, setErrorPopup] = useState({ show: false, message: '' }); // Error popup state
  const [successPopup, setSuccessPopup] = useState({ show: false, message: '' }); // Success popup state
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null }); // Add this state
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [isTableLoading, setIsTableLoading] = useState(true);
  const [isAddingRate, setIsAddingRate] = useState(false);
  const [isDeletingRate, setIsDeletingRate] = useState(false);

  // Add these refs after other state declarations
  const rateInputRef = React.useRef(null);
  const formRef = React.useRef(null);

  // Fetch vehicles when component mounts
  useEffect(() => {
    const fetchVehicles = async () => {
      setIsLoading(true);
      try {
        const result = await getVehicles();
        if (result.status === 'success' && Array.isArray(result.data)) {
          setVehicles(result.data);
        } else {
          setVehicles([]);
        }
        setFetchError(null);
      } catch (error) {
        console.error('Fetch error:', error);
        setFetchError(error.message);
        showError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  // Add new useEffect to fetch rates
  useEffect(() => {
    fetchVehicleRates();
  }, []); // Run once when component mounts

  /**
   * Fetches vehicle rates from the API and formats them for display
   * Handles loading states and error cases
   * Updates the rates state with formatted data
   */
  const fetchVehicleRates = async () => {
    setIsTableLoading(true);
    try {
      const result = await getVehicleRates();
      
      if (result.status === 'success' && result.data && result.data.rates) {
        const formattedRates = result.data.rates.map(rate => ({
          id: rate._id,
          vehicleType: rate.vehicleType,
          rate: rate.rate,
          vehicleId: rate.vehicleId || rate._id
        }));
        setRates(formattedRates);
      } else {
        setRates([]);
      }
    } catch (error) {
      console.error('Error fetching rates:', error);
      showError(error.message);
    } finally {
      setIsTableLoading(false);
    }
  };

  /**
   * Handles rate input changes with validation
   * Only allows numbers and decimal points
   * @param {Event} e - Input change event
   */
  const handleRateChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setRate(value);
      setErrorPopup({ show: false, message: '' });
    } else {
      showError('Please enter numbers only');
    }
  };

  /**
   * Handles both adding new rates and updating existing rates
   * Determines the HTTP method (POST/PATCH) based on editingId state
   * Validates input before making API call
   * @returns {void}
   */
  const handleAddRate = async () => {
    if (!selectedVehicle || !rate || isNaN(parseFloat(rate))) {
      showError(!selectedVehicle ? 'Please select a vehicle type' : 
                !rate ? 'Please enter a rate' : 
                'Please enter a valid number');
      return;
    }

    setIsAddingRate(true);
    try {
      const selectedVehicleObj = vehicles.find(v => v.vehicleType === selectedVehicle);
      if (!selectedVehicleObj) {
        throw new Error('Selected vehicle not found');
      }

      if (editingId) {
        await updateVehicleRate(selectedVehicleObj._id, parseFloat(rate));
      } else {
        await createVehicleRate(selectedVehicleObj._id, parseFloat(rate));
      }

      await fetchVehicleRates();
      showSuccess(`Rate ${editingId ? 'updated' : 'added'} successfully!`);
      resetForm();
    } catch (error) {
      console.error(`Error ${editingId ? 'updating' : 'adding'} rate:`, error);
      showError(error.message || `Failed to ${editingId ? 'update' : 'add'} rate`);
    } finally {
      setIsAddingRate(false);
    }
  };

  /**
   * Prepares the form for editing an existing rate
   * Sets form fields with current rate data
   * @param {Object} item - The rate item to edit
   * @param {string} item.vehicleType - The type of vehicle
   * @param {number} item.rate - The current rate amount
   * @param {string} item.id - The unique identifier of the rate
   */
  const handleEdit = (item) => {
    setSelectedVehicle(item.vehicleType);
    setRate(item.rate.toString());
    setEditingId(item.id);
    
    // Smooth scroll to top of the page
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

    // Focus the rate input after a short delay to ensure the scroll is complete
    setTimeout(() => {
      if (rateInputRef.current) {
        rateInputRef.current.focus();
      }
    }, 500);
  };

  /**
   * Initiates the rate deletion process
   * Shows confirmation dialog with rate details
   * @param {Object} item - The rate item to delete
   * @param {string} item.id - The rate ID
   * @param {string} item.vehicleId - The associated vehicle ID
   */
  const handleDelete = (item) => {
    setDeleteConfirm({ 
      show: true, 
      id: item.id,
      vehicleId: item.vehicleId || item.id // Fallback to item.id if vehicleId is not available
    });
  };

  /**
   * Confirms deletion of a rate
   * Makes API call to delete the rate
   */
  const confirmDelete = async () => {
    setIsDeletingRate(true);
    try {
      await deleteVehicleRate(deleteConfirm.vehicleId);
      await fetchVehicleRates();
      setDeleteConfirm({ show: false, id: null, vehicleId: null });
      showSuccess('Rate deleted successfully!');

      if (deleteConfirm.id === editingId) {
        resetForm();
      }
    } catch (error) {
      console.error('Error deleting rate:', error);
      showError(error.message || 'Failed to delete rate');
    } finally {
      setIsDeletingRate(false);
    }
  };

  /**
   * Resets form to initial state
   * Clears selection, input, and error message
   */
  const resetForm = () => {
    setSelectedVehicle('');
    setRate('');
    setEditingId(null);
    setInputError('');
  };

  /**
   * Shows error popup with message
   * @param {string} message - Error message to display
   */
  const showError = (message) => {
    setErrorPopup({ show: true, message });
    setTimeout(() => {
      setErrorPopup({ show: false, message: '' });
    }, 3000); // Hide after 3 seconds
  };

  /**
   * Shows success popup with message
   * @param {string} message - Success message to display
   */
  const showSuccess = (message) => {
    setSuccessPopup({ show: true, message });
    setTimeout(() => {
      setSuccessPopup({ show: false, message: '' });
    }, 3000); // Hide after 3 seconds
  };

  return (
    <div className="p-7 max-w-7xl mx-auto">
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

      {/* Delete Confirmation Popup */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="flex items-center text-yellow-500 mb-4">
              <FaExclamationTriangle className="text-2xl mr-2" />
              <h3 className="text-lg font-semibold text-gray-800">Confirm Deletion</h3>
            </div>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this rate? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm({ show: false, id: null })}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                disabled={isDeletingRate}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors flex items-center"
                disabled={isDeletingRate}
              >
                {isDeletingRate ? (
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

      {/* Header Section with Form */}
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-300 mb-4">Manage Vehicle Rates</h1>
        <div className="flex flex-wrap items-center gap-4">
          {/* Vehicle Type Dropdown */}
          <select
            value={selectedVehicle}
            onChange={(e) => {
              const selected = e.target.value;
              setSelectedVehicle(selected);
            }}
            className="px-4 py-3 bg-gray-900 text-gray-300 rounded-lg border border-gray-700 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all duration-300 min-w-[200px]"
            disabled={isLoading}
          >
            <option value="">Select Vehicle Type</option>
            {isLoading ? (
              <option value="" disabled>Loading vehicles...</option>
            ) : vehicles && vehicles.length > 0 ? (
              vehicles.map(vehicle => {
                return (
                  <option 
                    key={vehicle._id} 
                    value={vehicle.vehicleType}
                  >
                    {vehicle.vehicleType}
                  </option>
                );
              })
            ) : (
              <option value="" disabled>No vehicles available</option>
            )}
          </select>
          
          {/* Rate Input Field */}
          <input
            ref={rateInputRef}
            type="text"
            value={rate}
            onChange={handleRateChange}
            placeholder="Enter Rate Amount"
            className="px-4 py-3 bg-gray-900 text-gray-300 rounded-lg border border-gray-700 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all duration-300"
          />
          
          {/* Add/Update Button and Error Display */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleAddRate}
              disabled={isAddingRate}
              className="px-8 py-2 rounded-md bg-gray-500 text-white font-bold transition duration-200 hover:bg-white hover:text-black border-2 border-transparent hover:border-teal-500 flex items-center justify-center"
            >
              {isAddingRate ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  {editingId ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                editingId ? 'Update Rate' : 'Add Rate'
              )}
            </button>
            {editingId && (
              <button
                onClick={resetForm}
                className="px-8 py-2 rounded-md bg-gray-500 text-white font-bold transition duration-200 hover:bg-white hover:text-black border-2 border-transparent hover:border-teal-500 flex items-center justify-center"
              >
                Cancel
              </button>
            )}
            {inputError && (
              <span className="text-red-400 text-sm font-medium">{inputError}</span>
            )}
          </div>
        </div>
      </div>

      {/* Rates Table Section */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <table className="w-full">
          {/* Table Header */}
          <thead className="bg-gradient-to-r from-slate-400 via-slate-300 to-slate-200">
            <tr>
              <th className="py-3 px-4 text-left font-semibold">Vehicle Type</th>
              <th className="py-3 px-4 text-left font-semibold">Rate Amount</th>
              <th className="py-3 px-4 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          {/* Table Body */}
          <tbody className="divide-y divide-gray-200">
            {isTableLoading ? (
              <tr>
                <td colSpan="3" className="py-8 text-center text-gray-500 text-lg">
                  <div className="flex items-center justify-center">
                    <FaSpinner className="animate-spin text-2xl mr-2" />
                    Loading rates...
                  </div>
                </td>
              </tr>
            ) : rates.length === 0 ? (
              <tr>
                <td colSpan="3" className="py-8 text-center text-gray-500 text-lg">
                  No vehicle rates available
                </td>
              </tr>
            ) : (
              rates.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition duration-200">
                  <td className="py-3 px-4">{item.vehicleType}</td>
                  <td className="py-3 px-4">₹{item.rate}</td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-600 hover:to-yellow-400 text-white px-3 py-1 rounded-full flex items-center transition duration-300 transform hover:scale-105"
                      >
                        <FaEdit className="mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="bg-gradient-to-r from-red-400 to-red-600 hover:from-red-600 hover:to-red-400 text-white px-3 py-1 rounded-full flex items-center transition duration-300 transform hover:scale-105"
                      >
                        <FaTrash className="mr-1" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageRate;