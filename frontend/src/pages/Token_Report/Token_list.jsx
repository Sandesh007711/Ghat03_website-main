import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { FaTimes, FaFileExcel, FaSpinner, FaEdit, FaTrash, FaExpandAlt, FaCompressAlt } from 'react-icons/fa';
import DataTable from 'react-data-table-component';
import "react-datepicker/dist/react-datepicker.css";
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { getUsers, getVehicleRates, getFilteredTokens, updateToken, deleteToken } from '../../services/api';

/**
 * TokenList Component
 * Handles the display and filtering of token reports
 * Features: Date range selection, user filtering, and tabular display of token data
 */
const Token_list = () => {
  const [fromDate, setFromDate] = useState(new Date());           // Start date for filtering
  const [toDate, setToDate] = useState(new Date());              // End date for filtering
  const [selectedUser, setSelectedUser] = useState('');          // Selected user from dropdown
  const [filteredData, setFilteredData] = useState([]);         // Filtered token data
  const [errorPopup, setErrorPopup] = useState({ show: false, message: '' }); // Error popup state
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [tokens, setTokens] = useState([]);
  const [successPopup, setSuccessPopup] = useState({ show: false, message: '' }); // Success popup state
  const [selectedToken, setSelectedToken] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pending, setPending] = useState(true);
  const [perPage, setPerPage] = useState(20);
  const [totalRows, setTotalRows] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [updateFormData, setUpdateFormData] = useState(null);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false); // Add this new state with other states
  const [isFiltered, setIsFiltered] = useState(false); // Add this new state
  const [isDeleting, setIsDeleting] = useState(false); // Add new state for delete loading
  const [isPaginationLoading, setIsPaginationLoading] = useState(false);
  const [currentData, setCurrentData] = useState([]);

  // Helper function to sort tokens by date (newest first)
  const sortTokensByDate = (tokens) => {
    return [...tokens].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  // Updated useEffect for fetching users with authentication
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const result = await getUsers();
        if (result.status === 'success' && Array.isArray(result.data)) {
          setUsers(result.data);
        }
      } catch (error) {
        console.error('Fetch error:', error);
        showError(error.message);
      }
    };

    fetchUsers();
  }, []);

  // Add helper function to compare only dates
  const isSameOrAfterDate = (date1, date2) => {
    const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
    const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
    return d1 >= d2;
  };

  const isSameOrBeforeDate = (date1, date2) => {
    const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
    const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
    return d1 <= d2;
  };

  // Update fetchTokens function to handle user parameters
  const fetchTokens = async (searchParams = {}, newPage = currentPage) => {
    setIsLoading(true);
    try {
      const params = {
        page: newPage,
        limit: perPage,
      };

      // Add date parameters if they exist
      if (searchParams.fromDate) {
        // Create local date string YYYY-MM-DD
        const fromOffset = searchParams.fromDate.getTimezoneOffset() * 60000; // offset in milliseconds
        const localFrom = new Date(searchParams.fromDate.getTime() - fromOffset);
        params.dateFrom = localFrom.toISOString().split('T')[0];
      }
      if (searchParams.toDate) {
        // Create local date string YYYY-MM-DD
        const toOffset = searchParams.toDate.getTimezoneOffset() * 60000;
        const localTo = new Date(searchParams.toDate.getTime() - toOffset);
        params.dateTo = localTo.toISOString().split('T')[0];
      }

      // Add user parameter if selected - now passing only the user ID - now passing only the user ID
      if (searchParams.userId) {
        params.user = searchParams.userId._id; // Extract just the ID
      }

      const result = await getFilteredTokens(params);

      if (result.status === 'success') {
        const processedTokens = result.data.map(token => ({
          ...token,
          vehicleType: token.vehicleType || token.vehicleId?.vehicleType || 'N/A',
          vehicleRate: token.vehicleRate || 'N/A',
        }));

        setFilteredData(processedTokens);
        setTotalRows(result.totalCount || 0);
        setCurrentPage(newPage);

        if (processedTokens.length > 0) {
          showSuccess(`Found ${result.totalCount} matching records`);
        } else {
          showError('No matching records found for the selected criteria');
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error fetching tokens:', error);
      showError(error.message);
      setFilteredData([]);
      setTotalRows(0);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Update initial useEffect
  useEffect(() => {
    const initializePage = async () => {
      await fetchTokens({}, currentPage);
    };
    initializePage();
  }, [perPage]); // Remove currentPage dependency

  // Update handlePageChange to maintain filters
  const handlePageChange = async (page) => {
    const searchParams = {};

    if (isFiltered) {
      searchParams.fromDate = fromDate;
      searchParams.toDate = toDate;

      if (selectedUser) {
        const userObj = users.find(u => u.username === selectedUser);
        if (userObj) {
          searchParams.userId = { _id: userObj._id }; // Pass only the ID information
        }
      }
    }

    const success = await fetchTokens(searchParams, page);
    if (!success) {
      showError('Failed to load page data');
    }
  };

  // Update handlePerPageChange to maintain filters
  const handlePerPageChange = async (newPerPage, page) => {
    setPerPage(newPerPage);

    const searchParams = {};

    if (isFiltered) {
      searchParams.fromDate = fromDate;
      searchParams.toDate = toDate;

      if (selectedUser) {
        const userObj = users.find(u => u.username === selectedUser);
        if (userObj) {
          searchParams.userId = userObj._id;
        }
      }
    }

    const success = await fetchTokens(searchParams, page);
    if (!success) {
      showError('Failed to update rows per page');
    }
  };

  /**
   * Shows error popup with message
   * Automatically hides after 3 seconds
   * @param {string} message - Error message to display
   */
  const showError = (message) => {
    setErrorPopup({ show: true, message });
    setTimeout(() => {
      setErrorPopup({ show: false, message: '' });
    }, 3000);
  };

  /**
   * Shows success popup with message
   * @param {string} message - Success message to display
   */
  const showSuccess = (message) => {
    setSuccessPopup({ show: true, message });
    setTimeout(() => {
      setSuccessPopup({ show: false, message: '' });
    }, 3000);
  };

  /**
   * Handles form submission
   * Validates user selection and filters data
   * @param {Event} e - Form submission event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fromDate || !toDate) {
      showError('Please select both from and to dates');
      return;
    }

    const searchParams = {
      fromDate: fromDate,
      toDate: toDate
    };

    // Add user filter with the complete user object
    if (selectedUser) {
      const userObj = users.find(u => u.username === selectedUser);
      if (userObj) {
        searchParams.userId = userObj;
      }
    }

    setIsFiltered(true);
    setCurrentPage(1);

    const success = await fetchTokens(searchParams, 1);
    if (!success) {
      showError('Failed to fetch filtered data');
    }
  };

  /**
   * Helper function to format date and time
   * @param {Date} date - Date to format
   * @returns {string} Formatted date and time
   */
  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  /**
   * Exports the filtered data to Excel using ExcelJS
   */
  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Token Report');

    worksheet.columns = [
      { header: 'S.No.', key: 'sNo', width: 10 },
      { header: 'Created Date', key: 'createdAt', width: 25 }, // Increased width
      { header: 'Token No', key: 'tokenNo', width: 15 },
      { header: 'Driver Name', key: 'driverName', width: 20 },
      { header: 'Vehicle No', key: 'vehicleNo', width: 15 },
      { header: 'Vehicle Type', key: 'vehicleType', width: 15 },
      { header: 'Vehicle Rate', key: 'vehicleRate', width: 15 },
      { header: 'Quantity', key: 'quantity', width: 10 },
      { header: 'Place', key: 'place', width: 20 },
      { header: 'Route', key: 'route', width: 20 },
      { header: 'Operator', key: 'createdBy', width: 20 },
      { header: 'Challan Pin', key: 'challanPin', width: 15 },
    ];

    // Format the data for Excel with date and time
    const formattedData = filteredData.map((item, index) => ({
      sNo: index + 1 + (currentPage - 1) * perPage,
      driverName: item.driverName || 'N/A',
      driverMobileNo: item.driverMobileNo || 'N/A',
      vehicleType: item.vehicleType || 'N/A',
      vehicleRate: item.vehicleRate || 'N/A',
      vehicleNo: item.vehicleNo || 'N/A',
      place: item.place || 'N/A',
      route: item.route || 'N/A',
      tokenNo: item.tokenNo || 'N/A',
      challanPin: item.challanPin || 'N/A',
      quantity: item.quantity || 'N/A',
      createdBy: item.userId?.username || 'N/A',
      createdAt: formatDateTime(item.createdAt)
    }));

    // Add rows
    worksheet.addRows(formattedData);

    // Style the header row
    worksheet.getRow(1).font = { bold: true };

    // Generate Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `Token_Report_${new Date().toLocaleDateString()}.xlsx`);
  };

  // Add these new functions for handling updates and deletes
  const handleUpdate = (token) => {
    // Debug logs for initial token data

    const updatedToken = {
      ...token,
      userId: token.userId?._id || token.userId,
      vehicleType: token.vehicleType || token.vehicleId?.vehicleType,
      vehicleRate: token.vehicleRate || token.vehicleId?.rate
    };

    setUpdateFormData(updatedToken);
    setShowUpdateForm(true);
  };

  const handleUpdateSubmit = async (updatedData) => {
    setIsUpdating(true);

    try {
      const selectedVehicle = vehicleTypes.find(type =>
        type.vehicleType === (updatedData.vehicleType || updatedData.vehicleId?.vehicleType)
      );
      console.log('Selected vehicle for update:', selectedVehicle);

      if (!selectedVehicle) {
        throw new Error('Please select a valid vehicle type');
      }

      // Find the user object from the users array based on the token's username
      const userObj = users.find(u => u.username === updatedData.userId?.username) ||
        users.find(u => u._id === updatedData.userId);

      if (!userObj || !userObj._id) {
        throw new Error('Invalid user ID - Unable to find user');
      }

      const updatePayload = {
        userId: userObj._id, // Use the actual user ID from the found user object
        driverName: updatedData.driverName || '',
        driverMobileNo: parseInt(updatedData.driverMobileNo) || 0,
        vehicleNo: updatedData.vehicleNo || '',
        vehicleId: selectedVehicle.vehicleId,
        vehicleRate: parseFloat(selectedVehicle.rate) || 0,
        updateRate: true,
        quantity: updatedData.quantity || '', // Support both text and numbers
        place: updatedData.place || '',
        challanPin: updatedData.challanPin || '',
        route: updatedData.route || ''
      };


      const response = await updateToken(updatedData._id, updatePayload);

      await fetchTokens();
      setShowUpdateForm(false);
      showSuccess('Token updated successfully');

    } catch (error) {
      console.error('Update error details:', {
        error: error,
        message: error.message,
        stack: error.stack
      });
      showError(error.message || 'Failed to update token');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedToken || !selectedToken._id) return;

    setIsDeleting(true);
    try {
      await deleteToken(selectedToken._id);
      setFilteredData(prevData => prevData.filter(t => t._id !== selectedToken._id));
      setTotalRows(prev => prev - 1);
      showSuccess('Token deleted successfully');

      // Refresh the token list after deletion
      await fetchTokens();
    } catch (error) {
      console.error('Delete error:', error);
      showError(error.message || 'Failed to delete token');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setSelectedToken(null);
    }
  };

  // Define the columns for DataTable
  const columns = [
    {
      name: 'Actions',
      cell: (row) => (
        <div className="flex justify-center w-full gap-2">
          <button
            onClick={() => handleUpdate(row)}
            className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
            title="Update"
          >
            <FaEdit />
          </button>
          <button
            onClick={() => {
              setSelectedToken({ _id: row._id });
              setShowDeleteConfirm(true);
            }}
            className="p-2 text-red-600 hover:text-red-800 transition-colors"
            title="Delete"
          >
            <FaTrash />
          </button>
        </div>
      ),
      ignoreRowClick: true,
      width: '100px',
    },
    {
      name: 'S.No.',
      selector: (row, index) => index + 1 + (currentPage - 1) * perPage,
      sortable: false,
      width: '80px',
    },
    {
      name: 'Created Date',
      selector: row => formatDateTime(row.createdAt),
      sortable: true,
      width: '200px', // Increased width
      wrap: true, // Allow text wrapping
    },
    {
      name: 'Token No',
      selector: row => row.tokenNo,
      sortable: true,
      width: '120px',
    },
    {
      name: 'Driver Name',
      selector: row => row.driverName,
      sortable: true,
      width: '150px',
      wrap: true,
    },
    {
      name: 'Vehicle No',
      selector: row => row.vehicleNo,
      sortable: true,
      width: '130px',
    },
    {
      name: 'Vehicle Type',
      selector: row => row.vehicleType || 'N/A',
      sortable: true,
      width: '130px',
      wrap: true,
    },
    {
      name: 'Vehicle Rate',
      selector: row => row.vehicleRate || 'N/A',
      sortable: true,
      width: '120px',
    },
    {
      name: 'Quantity',
      selector: row => row.quantity,
      sortable: true,
      width: '100px',
    },
    {
      name: 'Place',
      selector: row => row.place,
      sortable: true,
      width: '130px',
      wrap: true,
    },
    {
      name: 'Route',
      selector: row => row.route || 'N/A',
      sortable: true,
      width: '130px',
      wrap: true,
    },
    {
      name: 'Operator',
      selector: row => row.userId?.username || 'N/A',
      sortable: true,
      width: '130px',
      wrap: true,
    },
    {
      name: 'Challan Pin',
      selector: row => row.challanPin || 'N/A',
      sortable: true,
      width: '120px',
    },
  ];

  // Custom styles for DataTable
  const customStyles = {
    headRow: {
      style: {
        backgroundColor: '#5A7863',
        color: '#EBF4DD',
        fontWeight: 'bold',
        minHeight: '52px',
        paddingLeft: '8px',
        paddingRight: '8px',
      },
    },
    headCells: {
      style: {
        fontSize: '14px',
        padding: '8px',
        justifyContent: 'center',
        textAlign: 'center',
        fontWeight: '600',
        color: '#EBF4DD',
      },
    },
    cells: {
      style: {
        padding: '8px',
        justifyContent: 'center',
        textAlign: 'center',
        '&:not(:last-of-type)': {
          borderRightWidth: '1px',
          borderRightColor: '#90AB8B',
        },
      },
    },
    rows: {
      style: {
        backgroundColor: '#EBF4DD',
        minHeight: '60px',
        '&:hover': {
          backgroundColor: '#90AB8B',
          color: '#3B4953',
        },
      },
    },
    pagination: {
      style: {
        border: 'none',
        backgroundColor: '#EBF4DD',
      },
    },
  };

  useEffect(() => {
    const fetchVehicleTypes = async () => {
      try {
        const result = await getVehicleRates();
        if (result.data && result.data.rates) {
          setVehicleTypes(result.data.rates);
        }
      } catch (error) {
        console.error('Error fetching vehicle types:', error);
        showError(error.message);
      }
    };

    fetchVehicleTypes();
  }, []);

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  // Add this function to handle showing all data
  const handleShowFullData = () => {
    setFromDate(null);
    setToDate(null);
    setSelectedUser('');
    setIsFiltered(false); // Set to false when showing full data
    setCurrentPage(1); // Reset to first page
    fetchTokens();
  };

  // Add this new function to handle vehicle type change
  const handleVehicleTypeChange = (e) => {
    const selectedVehicleType = e.target.value;
    const selectedVehicle = vehicleTypes.find(type => type.vehicleType === selectedVehicleType);


    if (selectedVehicle) {
      const updatedFormData = {
        ...updateFormData,
        vehicleType: selectedVehicleType,
        vehicleRate: selectedVehicle.rate,
        vehicleId: selectedVehicle
      };
      setUpdateFormData(updatedFormData);
    }
  };

  // Add reset filters function
  const handleResetFilters = async () => {
    setFromDate(new Date());
    setToDate(new Date());
    setSelectedUser('');
    setIsFiltered(false);
    setCurrentPage(1);
    await fetchTokens({}, 1);
  };

  return (
    <div className="p-7 max-w-7xl mx-auto">
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
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-[#EBF4DD] to-white rounded-lg shadow-2xl p-6 w-96 border-2 border-[#90AB8B]">
            <h3 className="text-lg font-semibold mb-4 text-[#3B4953]">Confirm Deletion</h3>
            <p className="mb-4 text-[#5A7863]">Are you sure you want to delete this token?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-[#5A7863] hover:text-[#3B4953] transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded hover:from-red-600 hover:to-red-700 transition-all flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <FaSpinner className="animate-spin" />
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
      <div className="bg-gradient-to-r from-[#5A7863] via-[#90AB8B] to-[#5A7863] rounded-2xl shadow-2xl p-6 mb-6">
        <h1 className="text-2xl font-bold text-[#EBF4DD] mb-4">Token Report</h1>
        <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col">
            <label htmlFor="fromDate" className="text-[#EBF4DD] mb-1 font-medium">From Date</label>
            <DatePicker
              id="fromDate"
              selected={fromDate}
              onChange={date => setFromDate(date)}
              className="px-4 py-3 bg-[#EBF4DD] text-[#3B4953] rounded-lg border-2 border-[#90AB8B] focus:outline-none focus:border-[#5A7863] focus:ring-2 focus:ring-[#5A7863] transition-all duration-300"
              placeholderText="From Date"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="toDate" className="text-[#EBF4DD] mb-1 font-medium">To Date</label>
            <DatePicker
              id="toDate"
              selected={toDate}
              onChange={date => setToDate(date)}
              className="px-4 py-3 bg-[#EBF4DD] text-[#3B4953] rounded-lg border-2 border-[#90AB8B] focus:outline-none focus:border-[#5A7863] focus:ring-2 focus:ring-[#5A7863] transition-all duration-300"
              placeholderText="To Date"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="userSelect" className="text-[#EBF4DD] mb-1 font-medium">Select User</label>
            <select
              id="userSelect"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="px-4 py-3 bg-[#EBF4DD] text-[#3B4953] rounded-lg border-2 border-[#90AB8B] focus:outline-none focus:border-[#5A7863] focus:ring-2 focus:ring-[#5A7863] transition-all duration-300 min-w-[200px]"
            >
              <option value="">Select User</option>
              {users.map((user) => (
                <option key={user._id} value={user.username}>
                  {user.username} ({user.route})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-transparent mb-1">Actions</label>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-8 py-2 rounded-md bg-[#EBF4DD] text-[#3B4953] font-bold transition duration-200 hover:bg-white hover:shadow-lg border-2 border-transparent hover:border-[#3B4953] flex items-center justify-center"
              >
                Apply Filters
              </button>

              {isFiltered && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-8 py-2 rounded-md bg-gradient-to-r from-[#5A7863] to-[#3B4953] text-[#EBF4DD] font-bold transition duration-200 hover:from-[#3B4953] hover:to-[#5A7863] flex items-center justify-center"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Table Section */}
      <div className={`bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 border-2 border-[#5A7863] ${isFullScreen ? 'fixed inset-0 z-50' : ''
        }`}>
        <div className="p-4 bg-gradient-to-r from-[#EBF4DD] to-white border-b-2 border-[#90AB8B] flex justify-between items-center">
          <button
            onClick={toggleFullScreen}
            className="flex items-center gap-2 bg-[#EBF4DD] hover:bg-white text-[#3B4953] px-4 py-2 rounded-lg transition duration-300 border-2 border-[#5A7863] hover:border-[#3B4953] font-medium"
          >
            {isFullScreen ? <FaCompressAlt /> : <FaExpandAlt />}
            {isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
          </button>
          {filteredData.length > 0 && (
            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 bg-gradient-to-r from-[#90AB8B] to-[#5A7863] hover:from-[#5A7863] hover:to-[#3B4953] text-[#EBF4DD] px-4 py-2 rounded-lg transition duration-300 font-medium"
            >
              <FaFileExcel />
              Export to Excel
            </button>
          )}
        </div>

        <div className={`${isFullScreen ? 'h-[calc(100vh-80px)] overflow-auto' : ''}`}>
          <DataTable
            columns={columns}
            data={filteredData}
            pagination
            paginationServer
            paginationPerPage={perPage}
            paginationDefaultPage={currentPage}
            paginationRowsPerPageOptions={[10, 20, 50, 100, 300, 600]}
            paginationTotalRows={totalRows}
            onChangePage={handlePageChange}
            onChangeRowsPerPage={handlePerPageChange}
            progressPending={isLoading}
            progressComponent={
              <div className="py-8 text-center text-[#5A7863]">
                <div className="flex flex-col items-center justify-center">
                  <FaSpinner className="animate-spin text-2xl mb-2" />
                  <span className="font-medium">Loading tokens...</span>
                </div>
              </div>
            }
            noDataComponent={
              <div className="py-8 text-center text-[#5A7863] text-lg">
                <div className="flex flex-col items-center justify-center">
                  <span className="font-medium">No data available</span>
                  <span className="text-sm text-[#90AB8B] mt-1">Select date range to view tokens</span>
                </div>
              </div>
            }
            customStyles={customStyles}
            sortIcon={<span className="ml-2">↕</span>}
            responsive
            highlightOnHover
            pointerOnHover
            striped
            className={isFullScreen ? 'h-full' : ''}
          />
        </div>
      </div>

      {/* Add Update Form Popup */}
      {showUpdateForm && updateFormData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center pt-20 z-50">
          <div className="bg-gradient-to-br from-[#EBF4DD] to-white rounded-2xl shadow-2xl p-6 w-[800px] max-h-[85vh] overflow-y-auto relative border-4 border-[#90AB8B]">
            {/* Close button */}
            <button
              onClick={() => setShowUpdateForm(false)}
              className="absolute top-4 right-4 text-[#5A7863] hover:text-[#3B4953]"
            >
              <FaTimes className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-bold text-[#3B4953] mb-4">Update Token</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleUpdateSubmit(updateFormData);
            }}>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-[#3B4953] text-sm font-bold mb-2">Driver Name</label>
                  <input
                    type="text"
                    value={updateFormData.driverName}
                    onChange={(e) => setUpdateFormData({ ...updateFormData, driverName: e.target.value })}
                    className="px-4 py-3 w-full bg-white text-[#3B4953] rounded-lg border-2 border-[#90AB8B] focus:outline-none focus:border-[#5A7863] focus:ring-2 focus:ring-[#5A7863] transition-all duration-300"
                  />
                </div>
                <div className="relative">
                  <label className="block text-[#3B4953] text-sm font-bold mb-2">Driver Mobile No.</label>
                  <input
                    type="text"
                    value={updateFormData.driverMobileNo}
                    onChange={(e) => setUpdateFormData({ ...updateFormData, driverMobileNo: e.target.value })}
                    className="px-4 py-3 w-full bg-white text-[#3B4953] rounded-lg border-2 border-[#90AB8B] focus:outline-none focus:border-[#5A7863] focus:ring-2 focus:ring-[#5A7863] transition-all duration-300"
                  />
                </div>
                <div className="relative">
                  <label className="block text-[#3B4953] text-sm font-bold mb-2">Vehicle Type</label>
                  <select
                    value={updateFormData.vehicleType || updateFormData.vehicleId?.vehicleType || ''}
                    onChange={handleVehicleTypeChange}
                    className="px-4 py-3 w-full bg-white text-[#3B4953] rounded-lg border-2 border-[#90AB8B] focus:outline-none focus:border-[#5A7863] focus:ring-2 focus:ring-[#5A7863] transition-all duration-300"
                  >
                    <option value="">Select Vehicle Type</option>
                    {vehicleTypes.map((type) => (
                      <option key={type._id} value={type.vehicleType}>
                        {type.vehicleType}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="relative">
                  <label className="block text-[#3B4953] text-sm font-bold mb-2">Vehicle Rate</label>
                  <input
                    type="text"
                    value={updateFormData.vehicleRate || ''}
                    readOnly
                    className="px-4 py-3 w-full bg-[#EBF4DD] text-[#5A7863] rounded-lg border-2 border-[#90AB8B] focus:outline-none transition-all duration-300"
                  />
                </div>
                <div className="relative">
                  <label className="block text-[#3B4953] text-sm font-bold mb-2">Vehicle No</label>
                  <input
                    type="text"
                    value={updateFormData.vehicleNo}
                    onChange={(e) => setUpdateFormData({ ...updateFormData, vehicleNo: e.target.value })}
                    className="px-4 py-3 w-full bg-white text-[#3B4953] rounded-lg border-2 border-[#90AB8B] focus:outline-none focus:border-[#5A7863] focus:ring-2 focus:ring-[#5A7863] transition-all duration-300"
                  />
                </div>
                <div className="relative">
                  <label className="block text-[#3B4953] text-sm font-bold mb-2">Place</label>
                  <input
                    type="text"
                    value={updateFormData.place}
                    onChange={(e) => setUpdateFormData({ ...updateFormData, place: e.target.value })}
                    className="px-4 py-3 w-full bg-white text-[#3B4953] rounded-lg border-2 border-[#90AB8B] focus:outline-none focus:border-[#5A7863] focus:ring-2 focus:ring-[#5A7863] transition-all duration-300"
                  />
                </div>
                <div className="relative">
                  <label className="block text-[#3B4953] text-sm font-bold mb-2">Route</label>
                  <input
                    type="text"
                    value={updateFormData.route}
                    onChange={(e) => setUpdateFormData({ ...updateFormData, route: e.target.value })}
                    className="px-4 py-3 w-full bg-white text-[#3B4953] rounded-lg border-2 border-[#90AB8B] focus:outline-none focus:border-[#5A7863] focus:ring-2 focus:ring-[#5A7863] transition-all duration-300"
                  />
                </div>
                <div className="relative">
                  <label className="block text-[#3B4953] text-sm font-bold mb-2">Challan Pin</label>
                  <input
                    type="text"
                    value={updateFormData.challanPin}
                    onChange={(e) => setUpdateFormData({ ...updateFormData, challanPin: e.target.value })}
                    className="px-4 py-3 w-full bg-white text-[#3B4953] rounded-lg border-2 border-[#90AB8B] focus:outline-none focus:border-[#5A7863] focus:ring-2 focus:ring-[#5A7863] transition-all duration-300"
                  />
                </div>
                <div className="relative">
                  <label className="block text-[#3B4953] text-sm font-bold mb-2">Quantity</label>
                  <input
                    type="text"
                    value={updateFormData.quantity}
                    onChange={(e) => setUpdateFormData({ ...updateFormData, quantity: e.target.value })}
                    placeholder="Enter quantity (text or number)"
                    className="px-4 py-3 w-full bg-white text-[#3B4953] rounded-lg border-2 border-[#90AB8B] focus:outline-none focus:border-[#5A7863] focus:ring-2 focus:ring-[#5A7863] transition-all duration-300"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowUpdateForm(false)}
                  className="px-6 py-2.5 bg-[#EBF4DD] text-[#5A7863] rounded-lg hover:bg-white hover:text-[#3B4953] transition-colors border-2 border-[#90AB8B] font-medium"
                  disabled={isUpdating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#90AB8B] to-[#5A7863] text-[#EBF4DD] rounded-lg hover:from-[#5A7863] hover:to-[#3B4953] transition-all flex items-center gap-2 font-medium"
                >
                  {isUpdating ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Token_list;
