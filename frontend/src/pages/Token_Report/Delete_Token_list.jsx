import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import DataTable from 'react-data-table-component';
import { getDeletedTokens } from '../../services/api';

const Delete_Token_list = () => {
  const [filteredData, setFilteredData] = useState([]);
  const [errorPopup, setErrorPopup] = useState({ show: false, message: '' });
  const [isLoading, setIsLoading] = useState(false);

  // Add initial data fetch
  useEffect(() => {
    fetchDeletedTokens();
  }, []);

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

  const fetchDeletedTokens = async () => {
    setIsLoading(true);
    try {
      const result = await getDeletedTokens();
      const tokens = result.data || [];
      const deletedTokens = tokens.filter(token => token.deletedAt);
      
      if (deletedTokens.length > 0) {
        const processedData = deletedTokens.map(token => ({
          name: token.driverName || 'N/A',
          mobileNo: token.driverMobileNo || 'N/A',
          place: token.place || 'N/A',
          quantity: token.quantity || 'N/A',
          route: token.route || 'N/A',
          tokenNo: token.tokenNo || 'N/A',
          vehicleNo: token.vehicleNo || 'N/A',
          vehicleType: token.vehicleType || token.vehicleId?.vehicleType || 'N/A',
          vehicleRate: token.vehicleRate || 'N/A',
          challanPin: token.challanPin || 'N/A',
          username: token.userId?.username || 'N/A',
          createdAt: formatDateTime(token.createdAt),
          deletedAt: formatDateTime(token.deletedAt),
          updatedBy: token.updatedBy || 'N/A'
        }));
        setFilteredData(processedData);
      } else {
        setFilteredData([]);
      }
    } catch (error) {
      console.error('Error fetching deleted tokens:', error);
      showError(error.message);
      setFilteredData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    {
      name: 'S.No.',
      selector: (row, index) => index + 1,
      sortable: false,
      width: '80px',
    },
    {
      name: 'Deleted Date',
      selector: row => row.deletedAt,
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
      selector: row => row.name,
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
      selector: row => row.vehicleType,
      sortable: true,
      width: '130px',
      wrap: true,
    },
    {
      name: 'Vehicle Rate',
      selector: row => row.vehicleRate,
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
      selector: row => row.route,
      sortable: true,
      width: '130px',
      wrap: true,
    },
    {
      name: 'Operator',
      selector: row => row.username,
      sortable: true,
      width: '130px',
      wrap: true,
    },
    {
      name: 'Challan Pin',
      selector: row => row.challanPin,
      sortable: true,
      width: '120px',
    },
  ];

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

      {/* Simplified Header Section */}
      <div className="bg-gradient-to-r from-[#5A7863] via-[#90AB8B] to-[#5A7863] rounded-2xl shadow-2xl p-6 mb-6">
        <h1 className="text-3xl font-bold text-[#EBF4DD] text-center drop-shadow-md">Deleted Tokens Report</h1>
      </div>

      {/* DataTable Section */}
      <div className="bg-white rounded-lg shadow-2xl overflow-hidden border-2 border-[#5A7863]">
        <DataTable
          columns={columns}
          data={filteredData}
          customStyles={customStyles}
          pagination
          responsive
          highlightOnHover
          pointerOnHover
          progressPending={isLoading}
          progressComponent={
            <div className="py-8 text-center text-[#5A7863] text-lg font-semibold">
              <div className="flex justify-center items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-b-4 border-[#5A7863]"></div>
                <span>Loading...</span>
              </div>
            </div>
          }
          noDataComponent={
            <div className="py-8 text-center text-[#5A7863] text-lg font-semibold">
              No data available
            </div>
          }
        />
      </div>
    </div>
  );
};

export default Delete_Token_list;