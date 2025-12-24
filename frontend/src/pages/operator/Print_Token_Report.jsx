import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { FaTimes, FaFileExcel } from 'react-icons/fa';
import "react-datepicker/dist/react-datepicker.css";
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import DataTable from 'react-data-table-component';
import { getCurrentUser, getTokenReport } from '../../services/api';

/**
 * TokenList Component
 * Handles the display and filtering of token reports
 * Features: Date range selection, user filtering, and tabular display of token data
 */
const Token_list = () => {
  // Add currentUser to state
  const [currentUser, setCurrentUser] = useState(null);
  // State Management
  const [fromDate, setFromDate] = useState(new Date());           // Start date for filtering
  const [toDate, setToDate] = useState(new Date());              // End date for filtering
  const [filteredData, setFilteredData] = useState([]);         // Filtered token data
  const [errorPopup, setErrorPopup] = useState({ show: false, message: '' }); // Error popup state
  const [showConfirm, setShowConfirm] = useState(false);         // Confirmation popup state
  const [loading, setLoading] = useState(false);
  const [tokens, setTokens] = useState([]);
  const [perPage, setPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [isFiltered, setIsFiltered] = useState(false);

  const fetchTokens = async (searchParams = {}, page = currentPage) => {
    setLoading(true);
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        showError('User not authenticated');
        return false;
      }

      const result = await getTokenReport({
        page,
        limit: perPage,
        username: currentUser.username,
        ...searchParams
      });

      if (result.status === 'success') {
        setTokens(result.data);
        setFilteredData(result.data);
        setTotalRows(result.totalCount);
        setCurrentPage(page);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error fetching tokens:', error);
      showError(error.message || 'Error loading tokens');
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializePage = async () => {
      await fetchTokens({}, currentPage);
    };
    initializePage();
  }, [perPage]); // Remove currentPage dependency

  // Add pagination handlers
  const handlePageChange = async (page) => {
    const searchParams = {
      fromDate: fromDate,
      toDate: toDate
    };
    
    const success = await fetchTokens(searchParams, page);
    if (!success) {
      showError('Failed to load page data');
    }
  };

  const handlePerPageChange = async (newPerPage, page) => {
    setPerPage(newPerPage);
    
    const searchParams = {
      fromDate: fromDate,
      toDate: toDate
    };
    
    const success = await fetchTokens(searchParams, page);
    if (!success) {
      showError('Failed to update rows per page');
    }
  };

  // Add DataTable columns configuration
  const columns = [
    {
      name: 'S.No.',
      selector: (row, index) => index + 1 + (currentPage - 1) * perPage,
      sortable: false,
      width: '80px',
    },
    {
      name: 'Created Date',
      selector: row => new Date(row.createdAt).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      sortable: true,
      width: '200px',
      wrap: true,
    },
    {
      name: 'Token No',
      selector: row => row.tokenNo || 'N/A',
      sortable: true,
      width: '120px',
    },
    {
      name: 'Driver Name',
      selector: row => row.driverName || 'N/A',
      sortable: true,
      width: '150px',
      wrap: true,
    },
    {
      name: 'Vehicle No',
      selector: row => row.vehicleNo || 'N/A',
      sortable: true,
      width: '130px',
    },
    {
      name: 'Vehicle Type',
      selector: row => row.displayVehicleType,
      sortable: true,
      width: '130px',
      wrap: true,
    },
    {
      name: 'Vehicle Rate',
      selector: row => row.displayVehicleRate,
      sortable: true,
      width: '120px',
    },
    {
      name: 'Quantity',
      selector: row => row.quantity || 'N/A',
      sortable: true,
      width: '100px',
    },
    {
      name: 'Place',
      selector: row => row.place || 'N/A',
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

  // Add custom styles for DataTable
  const customStyles = {
    headRow: {
      style: {
        backgroundColor: '#f1f5f9',
        fontWeight: 'bold',
      },
    },
    rows: {
      style: {
        minHeight: '60px',
        '&:hover': {
          backgroundColor: '#f8fafc',
        },
      },
    },
    pagination: {
      style: {
        border: 'none',
        backgroundColor: '#f8fafc',
      },
    },
  };

  // Debug user information
  useEffect(() => {
    const user = getCurrentUser();
  }, []);

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
   * Handles form submission
   * Validates user selection and filters data
   * @param {Event} e - Form submission event
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fromDate || !toDate) {
      showError('Please select both from and to dates');
      return;
    }
    setIsFiltered(true);
    setShowConfirm(true);
  };

  const handleResetFilters = async () => {
    setFromDate(new Date());
    setToDate(new Date());
    setIsFiltered(false);
    setCurrentPage(1);
    await fetchTokens({}, 1);
  };

  /**
   * Handles confirmation of data fetch
   */
  const handleConfirm = async () => {
    const searchParams = {
      fromDate: fromDate,
      toDate: toDate
    };
    
    const success = await fetchTokens(searchParams, 1);
    if (!success) {
      showError('Failed to fetch filtered data');
    }
    setShowConfirm(false);
  };

  /**
   * Exports the filtered data to Excel using ExcelJS
   */
  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Token Report');

    // Updated headers and data mapping to match the new structure
    worksheet.columns = [
      { header: 'Token No', key: 'tokenNo', width: 15 },
      { header: 'Driver Name', key: 'driverName', width: 20 },
      { header: 'Mobile No', key: 'driverMobileNo', width: 15 },
      { header: 'Vehicle No', key: 'vehicleNo', width: 15 },
      { header: 'Vehicle Type', key: 'vehicleType', width: 15 },
      { header: 'Vehicle Rate', key: 'vehicleRate', width: 15 },
      { header: 'Route', key: 'route', width: 15 },
      { header: 'Quantity', key: 'quantity', width: 12 },
      { header: 'Place', key: 'place', width: 15 },
      { header: 'Challan Pin', key: 'challanPin', width: 15 },
      { header: 'Created At', key: 'createdAt', width: 20 }
    ];

    // Transform data for Excel export
    const excelData = filteredData.map(item => ({
      tokenNo: item.tokenNo || 'N/A',
      driverName: item.driverName || 'N/A',
      driverMobileNo: item.driverMobileNo || 'N/A',
      vehicleNo: item.vehicleNo || 'N/A',
      vehicleType: item.displayVehicleType,
      vehicleRate: item.displayVehicleRate,
      route: item.route || 'N/A',
      quantity: item.quantity || 'N/A',
      place: item.place || 'N/A',
      challanPin: item.challanPin || 'N/A',
      createdAt: new Date(item.createdAt).toLocaleString()
    }));

    worksheet.addRows(excelData);
    worksheet.getRow(1).font = { bold: true };

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `Token_Report_${new Date().toLocaleDateString()}.xlsx`);
  };

  return (
    <div className="p-7 max-w-7xl mx-auto">
      {/* Confirmation Popup */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Confirm Submission</h3>
            <p className="mb-4">Are you sure you want to fetch the data?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Confirm
              </button>
            </div>
          </div>
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

      {/* Header Section with Form */}
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-300 mb-4">Token Report</h1>
        <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col">
            <label htmlFor="fromDate" className="text-gray-300 mb-1">From Date</label>
            <DatePicker
              id="fromDate"
              selected={fromDate}
              onChange={date => setFromDate(date)}
              className="px-4 py-3 bg-gray-900 text-gray-300 rounded-lg border border-gray-700 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all duration-300"
              placeholderText="From Date"
            />
          </div>
          
          <div className="flex flex-col">
            <label htmlFor="toDate" className="text-gray-300 mb-1">To Date</label>
            <DatePicker
              id="toDate"
              selected={toDate}
              onChange={date => setToDate(date)}
              className="px-4 py-3 bg-gray-900 text-gray-300 rounded-lg border border-gray-700 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all duration-300"
              placeholderText="To Date"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="px-8 py-2 rounded-md bg-gray-500 text-white font-bold transition duration-200 hover:bg-white hover:text-black border-2 border-transparent hover:border-teal-500 flex items-center justify-center"
            >
              Apply Filters
            </button>
            
            {isFiltered && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-8 py-2 rounded-md bg-red-500 text-white font-bold transition duration-200 hover:bg-white hover:text-black border-2 border-transparent hover:border-red-500 flex items-center justify-center"
              >
                Reset Filters
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
          <span className="text-gray-600">
            Total Tokens: {totalRows}
          </span>
          {filteredData.length > 0 && (
            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition duration-300"
            >
              <FaFileExcel />
              Export to Excel
            </button>
          )}
        </div>
        
        <DataTable
          columns={columns}
          data={filteredData}
          pagination
          paginationServer
          paginationTotalRows={totalRows}
          paginationPerPage={perPage}
          paginationDefaultPage={currentPage}
          paginationRowsPerPageOptions={[10, 20, 25, 50, 100]}
          onChangePage={handlePageChange}
          onChangeRowsPerPage={handlePerPageChange}
          progressPending={loading}
          progressComponent={
            <div className="flex justify-center items-center gap-2 p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              <span className="text-gray-500">Loading tokens...</span>
            </div>
          }
          noDataComponent={
            <div class="py-8 text-center text-gray-500 text-lg">
              <div class="flex flex-col items-center justify-center">
                <span class="font-medium">No data available</span>
                <span class="text-sm text-gray-400 mt-1">Select date range to view records</span>
              </div>
            </div>
          }
          customStyles={customStyles}
          responsive
          highlightOnHover
          pointerOnHover
          striped
        />
      </div>
    </div>
  );
};

export default Token_list;