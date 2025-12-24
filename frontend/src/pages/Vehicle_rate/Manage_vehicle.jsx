import React, { useState, useEffect, useRef } from 'react';
import { FaEdit, FaTrash, FaSort, FaTimes, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import { getAllVehicles, createVehicle, updateVehicleType, deleteVehicle } from '../../services/api';

/**
 * VehicleRate Component
 * Purpose: Manages vehicle types with CRUD operations and sorting functionality
 * Features: Add, Edit, Delete, Sort vehicle types with responsive design
 */
const VehicleRate = () => {
  // Add ref for input field
  const inputRef = useRef(null);
  // State for managing input field value
  const [vehicleType, setVehicleType] = useState('');
  // State for storing list of vehicle types
  const [vehicleList, setVehicleList] = useState([]);
  // State for tracking which vehicle is being edited (-1 means none)
  const [editIndex, setEditIndex] = useState(null);
  // State for managing sort direction (ascending/descending)
  const [sortOrder, setSortOrder] = useState('asc');
  // State for managing error popup
  const [errorPopup, setErrorPopup] = useState({ show: false, message: '' });
  // State for managing success popup
  const [successPopup, setSuccessPopup] = useState({ show: false, message: '' });
  // Add new state for delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, index: null });
  // Add loading state
  const [isLoading, setIsLoading] = useState(true);
  // Add delete loading state
  const [isDeleting, setIsDeleting] = useState(false);
  // Add new loading state for create operation
  const [isCreating, setIsCreating] = useState(false);

  // Update fetchVehicles function
  const fetchVehicles = async () => {
    try {
      const response = await getAllVehicles();
      
      if (response && response.data) {
        const vehicles = response.data;
        setVehicleList(vehicles.map(vehicle => ({
          id: vehicle._id,
          vehicleType: vehicle.vehicleType
        })));
      } else {
        console.error('Unexpected response structure:', response);
        showError('Invalid data format received from server');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      if (error.status === 401) {
        showError('Session expired. Please login again');
      } else {
        showError(`Failed to fetch vehicles: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch vehicles when component mounts
  useEffect(() => {
    fetchVehicles();
  }, []);

  /**
   * Handles adding new vehicle or updating existing one
   * If in edit mode: updates existing vehicle
   * If in add mode: adds new vehicle to list
   */
  const handleAddVehicle = async () => {
    if (!vehicleType.trim()) {
      showError('Please enter the vehicle type');
      return;
    }

    setIsCreating(true);
    try {
      if (editIndex !== null) {
        const vehicleToUpdate = vehicleList[editIndex];
        

        const response = await updateVehicleType(vehicleToUpdate.id, {
          vehicleType: vehicleType
        });

        if (response.status === 'success') {
          await fetchVehicles();
          setEditIndex(null);
          setVehicleType('');
          showSuccess('Vehicle type updated successfully!');
        }
      } else {
        const response = await createVehicle({
          vehicleType: vehicleType
        });

        if (response) {
          await fetchVehicles();
          setVehicleType('');
          showSuccess('Vehicle type added successfully!');
        }
      }
    } catch (error) {
      console.error('Error details:', error);
      if (error.status === 401) {
        showError('Session expired. Please login again');
      } else if (error.status === 404) {
        showError('Vehicle not found');
      } else {
        showError(error.message || 'Failed to update vehicle type');
      }
    } finally {
      setIsCreating(false);
    }
  };

  /**
   * Handles editing of vehicle type
   * @param {number} index - Index of vehicle to edit
   * Sets the input field with selected vehicle's value
   * Enters edit mode for that vehicle
   */
  const handleEditVehicle = (index) => {
    setVehicleType(vehicleList[index].vehicleType);
    setEditIndex(index);
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Focus the input field after a small delay to ensure scroll completed
    setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
  };

  /**
   * Handles deletion of vehicle type
   * @param {number} index - Index of vehicle to delete
   * Resets form if currently editing
   * Removes vehicle from list
   */
  const handleDeleteVehicle = (index) => {
    setDeleteConfirm({ show: true, index });
  };

  // Update confirmDelete function
  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      const vehicleToDelete = vehicleList[deleteConfirm.index];
      await deleteVehicle(vehicleToDelete.id);

      await fetchVehicles();
      setDeleteConfirm({ show: false, index: null });
      showSuccess('Vehicle type deleted successfully!');
      
      if (editIndex === deleteConfirm.index) {
        setVehicleType('');
        setEditIndex(null);
      }
    } catch (error) {
      if (error.status === 401) {
        showError('Session expired. Please login again');
      } else {
        showError(error.message || 'Failed to delete vehicle');
      }
      setDeleteConfirm({ show: false, index: null });
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Handles sorting of vehicle list
   * Toggles between ascending and descending order
   * Uses localeCompare for string comparison
   */
  const handleSort = () => {
    const sortedList = [...vehicleList].sort((a, b) => {
      return sortOrder === 'asc' 
        ? a.vehicleType.localeCompare(b.vehicleType)
        : b.vehicleType.localeCompare(a.vehicleType);
    });
    setVehicleList(sortedList);
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  /**
   * Handles keyboard events
   * @param {Event} e - Keyboard event
   * Triggers add/update when Enter key is pressed
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddVehicle();
    }
  };

  // Add popup error handler
  const showError = (message) => {
    setErrorPopup({ show: true, message });
    setTimeout(() => {
      setErrorPopup({ show: false, message: '' });
    }, 3000); // Hide after 3 seconds
  };

  // Add popup success handler
  const showSuccess = (message) => {
    setSuccessPopup({ show: true, message });
    setTimeout(() => {
      setSuccessPopup({ show: false, message: '' });
    }, 3000); // Hide after 3 seconds
  };

  // Add cancel edit handler
  const handleCancelEdit = () => {
    setVehicleType('');
    setEditIndex(null);
  };

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
            <p className="text-gray-600 mb-6">Are you sure you want to delete this vehicle type?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm({ show: false, index: null })}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className={`px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors flex items-center ${isDeleting ? 'opacity-75 cursor-not-allowed' : ''}`}
                disabled={isDeleting}
              >
                {isDeleting ? (
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
        <h1 className="text-2xl font-bold text-gray-300 mb-4">Manage Vehicle Type</h1>
        <div className="flex flex-wrap items-center gap-4">
          <input
            ref={inputRef}
            type="text"
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter vehicle type"
            className="px-4 py-3 bg-gray-900 text-gray-300 rounded-lg border border-gray-700 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all duration-300"
            disabled={isCreating}
          />
          <button
            onClick={handleAddVehicle}
            disabled={isCreating}
            className={`px-8 py-2 rounded-md bg-gray-500 text-white font-bold transition duration-200 hover:bg-white hover:text-black border-2 border-transparent hover:border-teal-500 flex items-center justify-center ${isCreating ? 'opacity-75 cursor-not-allowed' : ''}`}
          >
            {isCreating ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                {editIndex !== null ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              editIndex !== null ? 'Update Vehicle' : 'Add Vehicle'
            )}
          </button>
          {editIndex !== null && (
            <button
              onClick={handleCancelEdit}
              className="px-8 py-2 rounded-md bg-gray-500 text-white font-bold transition duration-200 hover:bg-white hover:text-black border-2 border-transparent hover:border-teal-500 flex items-center justify-center"
            >
              Cancel
            </button>
          )}
          <p className="text-sm font-semibold text-gray-300">Total Entries: {vehicleList.length}</p>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-slate-400 via-slate-300 to-slate-200">
            <tr>
              <th className="py-3 px-4 text-left font-semibold">
                <div className="flex items-center cursor-pointer" onClick={handleSort}>
                  Vehicle Type
                  <FaSort className="ml-2" />
                </div>
              </th>
              <th className="py-3 px-4 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan="2" className="py-8">
                  <div className="flex flex-col items-center justify-center">
                    <FaSpinner className="animate-spin text-2xl mr-2 text-gray-400" />
                    <span className="text-gray-500">Loading vehicles...</span>
                  </div>
                </td>
              </tr>
            ) : vehicleList.length === 0 ? (
              <tr>
                <td colSpan="2" className="py-8 text-center text-gray-500 text-lg">
                  No vehicles available
                </td>
              </tr>
            ) : (
              vehicleList.map((vehicle, index) => (
                <tr key={vehicle.id} className="hover:bg-gray-50 transition duration-200">
                  <td className="py-3 px-4">{vehicle.vehicleType}</td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditVehicle(index)}
                        className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-600 hover:to-yellow-400 text-white px-3 py-1 rounded-full flex items-center transition duration-300 transform hover:scale-105"
                      >
                        <FaEdit className="mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteVehicle(index)}
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

export default VehicleRate;