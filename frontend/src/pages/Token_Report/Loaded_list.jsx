import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { FaTimes, FaSpinner, FaExpandAlt, FaCompressAlt } from 'react-icons/fa';
import DataTable from 'react-data-table-component';
import "react-datepicker/dist/react-datepicker.css";
import { getLoadedTokens } from '../../services/api';

/**
 * LoadedList Component
 * Handles the display and filtering of loaded tokens report
 * Features: Date range selection, user filtering, and tabular display of loaded token data
 */
const Loaded_list = () => {
  const [isFiltered, setIsFiltered] = useState(false);
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [filteredData, setFilteredData] = useState([]);
  const [errorPopup, setErrorPopup] = useState({ show: false, message: '' });
  const [successPopup, setSuccessPopup] = useState({ show: false, message: '' });
  const [perPage, setPerPage] = useState(20); // Changed default to 20 to match Token_list
  const [currentPage, setCurrentPage] = useState(1);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0); // Add this state

  // Add helper functions for date comparison
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

  // Update fetchTokenData function to use API service
  const fetchTokenData = async (searchParams = {}, newPage = currentPage) => {
    setIsLoading(true);
    try {
      const params = {
        page: newPage,
        limit: perPage
      };

      // Add date filters if they exist
      // Add date filters if they exist
      if (searchParams.fromDate) {
        // Create local date string YYYY-MM-DD
        const fromOffset = searchParams.fromDate.getTimezoneOffset() * 60000;
        const localFrom = new Date(searchParams.fromDate.getTime() - fromOffset);
        params.dateFrom = localFrom.toISOString().split('T')[0];
      }
      if (searchParams.toDate) {
        // Create local date string YYYY-MM-DD
        const toOffset = searchParams.toDate.getTimezoneOffset() * 60000;
        const localTo = new Date(searchParams.toDate.getTime() - toOffset);
        params.dateTo = localTo.toISOString().split('T')[0];
      }

      const result = await getLoadedTokens(params);

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
      console.error('Error in fetchTokenData:', error);
      showError(error.message);
      setFilteredData([]);
      setTotalRows(0);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Remove loadInitialData function since we're using fetchTokenData for everything
  useEffect(() => {
    const initializePage = async () => {
      await fetchTokenData({}, currentPage);
    };
    initializePage();
  }, [perPage]); // Remove currentPage dependency

  // Error handling and form submission functions
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

  // Modified handleSubmit - removed user check
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fromDate || !toDate) {
      showError('Please select both from and to dates');
      return;
    }

    setIsFiltered(true);
    setCurrentPage(1);

    const searchParams = {
      fromDate: fromDate,
      toDate: toDate
    };

    const success = await fetchTokenData(searchParams, 1);
    if (!success) {
      showError('Failed to fetch filtered data');
    }
  };

  // Add these new functions
  const handlePageChange = async (page) => {
    const searchParams = isFiltered ? {
      fromDate: fromDate,
      toDate: toDate
    } : {};

    const success = await fetchTokenData(searchParams, page);
    if (!success) {
      showError('Failed to load page data');
    }
  };

  const handlePerPageChange = async (newPerPage, page) => {
    setPerPage(newPerPage);

    const searchParams = isFiltered ? {
      fromDate: fromDate,
      toDate: toDate
    } : {};

    const success = await fetchTokenData(searchParams, page);
    if (!success) {
      showError('Failed to update rows per page');
    }
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata'
    });
  };

  // Add reset filters function
  const handleResetFilters = async () => {
    setFromDate(new Date());
    setToDate(new Date());
    setIsFiltered(false);
    setCurrentPage(1);
    await fetchTokenData({}, 1);
  };

  // Define columns for DataTable
  const columns = [
    {
      name: 'S.No.',
      selector: (row, index) => index + 1 + (currentPage - 1) * perPage,
      sortable: false,
      width: '80px',
    },
    {
      name: 'Loaded Date',
      selector: row => formatDateTime(row.loadedAt),
      sortable: true,
      width: '200px',
      wrap: true,
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
      selector: row => row.vehicleType || row.vehicleId?.vehicleType || 'N/A',
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

  // Update custom styles to match the formatting
  const customStyles = {
    headRow: {
      style: {
        background: '#5A7863',
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
        color: '#3B4953',
        '&:not(:last-of-type)': {
          borderRightWidth: '1px',
          borderRightColor: '#90AB8B',
        },
      },
    },
    rows: {
      style: {
        minHeight: '60px',
        backgroundColor: '#EBF4DD',
        '&:hover': {
          backgroundColor: '#90AB8B',
          color: '#EBF4DD',
        },
      },
      stripedStyle: {
        backgroundColor: '#f5f9f3',
      },
    },
  };

  return (
    <div className="p-7 max-w-7xl mx-auto bg-white min-h-screen">
      {/* Error Popup */}
      {errorPopup.show && (
        <div className="fixed top-4 right-4 bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 text-red-800 px-6 py-4 rounded-lg shadow-xl flex items-center gap-3 animate-slide-in-top z-50">
          <span className="font-semibold">{errorPopup.message}</span>
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
        <div className="fixed top-4 right-4 bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-500 text-green-800 px-6 py-4 rounded-lg shadow-xl flex items-center gap-3 animate-slide-in-top z-50">
          <span className="font-semibold">{successPopup.message}</span>
          <button
            onClick={() => setSuccessPopup({ show: false, message: '' })}
            className="text-green-600 hover:text-green-800 transition-colors"
          >
            <FaTimes />
          </button>
        </div>
      )}

      {/* Header Section with Form */}
      <div className="bg-gradient-to-r from-[#5A7863] via-[#90AB8B] to-[#5A7863] rounded-2xl shadow-2xl p-6 mb-6">
        <h1 className="text-3xl font-bold text-[#EBF4DD] mb-6 drop-shadow-md">Loaded Report</h1>
        <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col">
            <label htmlFor="fromDate" className="text-[#EBF4DD] mb-2 font-semibold">From Date</label>
            <DatePicker
              id="fromDate"
              selected={fromDate}
              onChange={date => setFromDate(date)}
              className="px-4 py-3 bg-[#EBF4DD] text-[#3B4953] rounded-lg border-2 border-[#90AB8B] focus:outline-none focus:border-[#5A7863] focus:ring-2 focus:ring-[#90AB8B] transition-all duration-300"
              placeholderText="From Date"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="toDate" className="text-[#EBF4DD] mb-2 font-semibold">To Date</label>
            <DatePicker
              id="toDate"
              selected={toDate}
              onChange={date => setToDate(date)}
              className="px-4 py-3 bg-[#EBF4DD] text-[#3B4953] rounded-lg border-2 border-[#90AB8B] focus:outline-none focus:border-[#5A7863] focus:ring-2 focus:ring-[#90AB8B] transition-all duration-300"
              placeholderText="To Date"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-transparent mb-2 font-semibold">Actions</label>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-8 py-3 rounded-lg bg-[#EBF4DD] text-[#3B4953] font-bold transition duration-300 hover:bg-white hover:shadow-lg border-2 border-[#90AB8B] hover:border-[#5A7863] flex items-center justify-center"
              >
                Apply Filters
              </button>

              {isFiltered && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-8 py-3 rounded-lg bg-gradient-to-r from-[#5A7863] to-[#3B4953] text-[#EBF4DD] font-bold transition duration-300 hover:from-[#3B4953] hover:to-[#5A7863] hover:shadow-lg flex items-center justify-center"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Replace the existing table section with DataTable */}
      <div className={`bg-white rounded-lg shadow-2xl overflow-hidden border-2 border-[#5A7863] transition-all duration-300 ${isFullScreen ? 'fixed inset-0 z-50' : ''
        }`}>
        <div className="p-4 bg-gradient-to-r from-[#90AB8B] to-[#5A7863] border-b flex justify-between items-center">
          <button
            onClick={toggleFullScreen}
            className="flex items-center gap-2 bg-[#EBF4DD] hover:bg-white text-[#3B4953] px-4 py-2 rounded-lg transition duration-300 font-semibold shadow-md hover:shadow-lg"
          >
            {isFullScreen ? <FaCompressAlt /> : <FaExpandAlt />}
            {isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
          </button>
        </div>

        <div className={`${isFullScreen ? 'h-[calc(100vh-80px)] overflow-auto' : ''}`}>
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
            progressPending={isLoading}
            progressComponent={
              <div className="py-8 text-center text-[#5A7863]">
                <div className="flex flex-col items-center justify-center">
                  <FaSpinner className="animate-spin text-3xl mb-3" />
                  <span className="font-semibold text-lg">Loading tokens...</span>
                </div>
              </div>
            }
            noDataComponent={
              <div className="py-8 text-center text-[#5A7863]">
                <div className="flex flex-col items-center justify-center">
                  <span className="font-semibold text-lg">No data available</span>
                  <span className="text-sm text-[#90AB8B] mt-2">Select date range to view records</span>
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
    </div>
  );
};

export default Loaded_list;
