import React, { useState, useEffect } from 'react';
import { FaTimes, FaSpinner } from 'react-icons/fa';
import DataTable from 'react-data-table-component';
import { getUpdatedTokens } from '../../services/api';

const Update_Token_list = () => {
  const [filteredData, setFilteredData] = useState([]);
  const [errorPopup, setErrorPopup] = useState({ show: false, message: '' });
  const [loading, setLoading] = useState(false);
  const [perPage, setPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);

  // Error handling function
  const showError = (message) => {
    setErrorPopup({ show: true, message });
    setTimeout(() => {
      setErrorPopup({ show: false, message: '' });
    }, 3000);
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

  const fetchTokens = async (page = currentPage) => {
    setLoading(true);
    try {
      const params = {
        page: page,
        limit: perPage
      };

      const result = await getUpdatedTokens(params);
      
      if (result.status === 'success') {
        setFilteredData(result.data);
        setTotalRows(result.totalCount || 0);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      showError(error.message);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokens();
  }, [perPage]);

  const handlePageChange = async (page) => {
    await fetchTokens(page);
  };

  const handlePerPageChange = async (newPerPage, page) => {
    setPerPage(newPerPage);
    await fetchTokens(page);
  };

  const columns = [
    {
      name: 'S.No.',
      selector: (row, index) => index + 1 + (currentPage - 1) * perPage,
      sortable: false,
      width: '80px',
    },
    {
      name: 'Updated Date',
      selector: row => formatDateTime(row.updatedAt || row.createdAt),
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

      {/* Simplified Header Section */}
      <div className="bg-gradient-to-r from-[#5A7863] via-[#90AB8B] to-[#5A7863] rounded-2xl shadow-2xl p-6 mb-6">
        <h1 className="text-2xl font-bold text-[#EBF4DD] text-center">Updated Tokens Report</h1>
      </div>

      {/* DataTable Section */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden border-2 border-[#5A7863]">
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
            <div className="flex items-center justify-center gap-2 py-8 text-[#5A7863]">
              <FaSpinner className="animate-spin text-2xl" />
              <span className="font-medium">Loading data...</span>
            </div>
          }
          customStyles={customStyles}
          noDataComponent={
            <div className="py-8 text-center text-[#5A7863] text-lg">
              <span className="font-medium">No data available</span>
            </div>
          }
          responsive
          highlightOnHover
          pointerOnHover
        />
      </div>
    </div>
  );
};

export default Update_Token_list;