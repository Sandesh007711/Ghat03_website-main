import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaTimes } from 'react-icons/fa';
import { QRCodeSVG } from 'qrcode.react';
import ReactDOMServer from 'react-dom/server';
import DataTable from 'react-data-table-component';
import { 
  getVehicleRates, 
  getOperatorTokens, 
  createOperatorToken,
  getCurrentUser 
} from '../../services/api';

const Op_Home = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [entries, setEntries] = useState([]);
  const [formData, setFormData] = useState({
    userId: '',
    route: '',
    driverName: '',
    driverMobile: '',
    vehicleNo: '',
    vehicleType: '',
    vehicleRate: '',
    quantity: '',
    place: '',
    chalaanPin: ''
  });
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [tempFormData, setTempFormData] = useState(null);
  const [successPopup, setSuccessPopup] = useState({ show: false, message: '' });
  const [errorPopup, setErrorPopup] = useState({ show: false, message: '' });
  const [vehicleRates, setVehicleRates] = useState([]);
  const [apiTokens, setApiTokens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [perPage, setPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);

  const generateRandomToken = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleAddToken = () => {
    setIsModalOpen(true);
  };

  const buttonStyle = {
    appearance: 'none',
    backgroundColor: 'transparent',
    border: '0.125em solid #1A1A1A',
    borderRadius: '0.9375em',
    boxSizing: 'border-box',
    color: '#3B3B3B',
    cursor: 'pointer',
    display: 'inline-block',
    fontFamily: 'Roobert, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
    fontSize: '16px',
    fontWeight: '600',
    lineHeight: 'normal',
    margin: '0',
    minHeight: '3.75em',
    minWidth: '0',
    outline: 'none',
    padding: '1em 2.3em',
    textAlign: 'center',
    textDecoration: 'none',
    transition: 'all 300ms cubic-bezier(.23, 1, 0.32, 1)',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    touchAction: 'manipulation',
    willChange: 'transform'
  };

  const buttonHoverStyle = {
    color: '#fff',
    backgroundColor: '#1A1A1A',
    boxShadow: 'rgba(0, 0, 0, 0.25) 0 8px 15px',
    transform: 'translateY(-2px)'
  };

  const buttonActiveStyle = {
    boxShadow: 'none',
    transform: 'translateY(0)'
  };

  // Modify generateQuantityOptions function
  const generateQuantityOptions = () => {
    const options = [];
    for (let i = 0; i <= 1000; i += 50) {
      options.push(i.toString());
    }
    return ["Select Quantity", ...options];
  };

  const quantityOptions = generateQuantityOptions();

  useEffect(() => {
    const setLoggedInUserData = () => {
      try {
        const currentUser = getCurrentUser();
        
        setFormData(prev => ({
          ...prev,
          userId: currentUser._id || '',
          username: currentUser.username || '',
          route: currentUser.route || ''
        }));

        setUsers([{
          id: currentUser._id || '',
          name: currentUser.username || '',
          route: currentUser.route || ''
        }]);
      } catch (error) {
        console.error('Error setting user data:', error);
        showError('Error loading user data');
      }
    };

    setLoggedInUserData();
  }, []);

  useEffect(() => {
    const fetchVehicleRates = async () => {
      try {
        const result = await getVehicleRates();
        if (result?.status === 'success' && result?.data?.rates) {
          setVehicleRates(result.data.rates);
        } else {
          showError('Failed to load vehicle rates');
        }
      } catch (error) {
        console.error('Error fetching vehicle rates:', error);
        showError(error.message || 'Error loading vehicle rates');
      }
    };

    fetchVehicleRates();
  }, []);

  const fetchUserTokens = async (page = currentPage) => {
    setLoading(true);
    try {
      const result = await getOperatorTokens(page, perPage);
      
      if (result?.status === 'success') {
        setApiTokens(result.data);
        setEntries(result.data);
        setTotalRows(result.totalCount || 0);
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
      await fetchUserTokens(currentPage);
    };
    initializePage();
  }, [perPage]); // Remove currentPage dependency

  const handlePageChange = async (page) => {
    const success = await fetchUserTokens(page);
    if (!success) {
      showError('Failed to load page data');
    }
  };

  const handlePerPageChange = async (newPerPage, page) => {
    setPerPage(newPerPage);
    const success = await fetchUserTokens(page);
    if (!success) {
      showError('Failed to update rows per page');
    }
  };

  // Update handleInputChange function
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Prevent changes to userId and route
    if (name === 'userId' || name === 'route') {
      return;
    }

    // Special handling for quantity field
    if (name === 'quantity') {
      if (value === 'Select Quantity') {
        setFormData(prev => ({ ...prev, quantity: '' }));
        return;
      }
      setFormData(prev => ({
        ...prev,
        quantity: value
      }));
      return;
    }

    if (name === 'vehicleType') {
      const selectedVehicle = vehicleRates.find(v => v.vehicleType === value);
      if (selectedVehicle) {
        setFormData(prev => ({
          ...prev,
          vehicleType: selectedVehicle.vehicleType,
          vehicleId: selectedVehicle.vehicleId || selectedVehicle._id, // Add fallback to _id
          vehicleRate: selectedVehicle.rate.toString() // Use rate instead of vehicleRate
        }));
      } else {
        showError('Invalid vehicle selection');
      }
      return;
    }

    if (name === 'vehicleRate' && value === 'Select Rate') {
      return; // Don't update state if default option is selected
    }

    if (name === 'quantity' && value === 'Select Quantity') {
      return; // Don't update state if default option is selected
    }

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

  // Update handleSubmitClick validation
  const handleSubmitClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Validate required fields
    if (!formData.driverName.trim()) {
      showError('Driver Name is required');
      return;
    }

    if (!formData.vehicleNo.trim()) {
      showError('Vehicle Number is required');
      return;
    }

    if (!formData.vehicleType) {
      showError('Please select a vehicle type');
      return;
    }

    // Updated quantity validation
    if (formData.quantity === '' || formData.quantity === 'Select Quantity') {
      showError('Please select a quantity');
      return;
    }

    if (!formData.driverMobile || formData.driverMobile.length !== 10) {
      showError('Please enter a valid 10-digit mobile number');
      return;
    }

    try {
      const selectedVehicle = vehicleRates.find(
        vehicle => vehicle.vehicleType === formData.vehicleType
      );

      if (!selectedVehicle) {
        throw new Error('Please select a valid vehicle type');
      }

      // Log the form data before submission for debugging
      console.log('Form data before submission:', {
        ...formData,
        quantity: parseInt(formData.quantity)
      });

      // If all validations pass, show confirmation dialog
      setShowSubmitConfirm(true);
    } catch (error) {
      console.error('Form validation error:', error);
      showError(error.message);
    }
  };

  const showSuccess = (message) => {
    setSuccessPopup({ show: true, message });
    setTimeout(() => {
      setSuccessPopup({ show: false, message: '' });
    }, 3000);
  };

  const showError = (message) => {
    setErrorPopup({ show: true, message });
    setTimeout(() => {
      setErrorPopup({ show: false, message: '' });
    }, 3000);
  };

  // Add refreshTable function
  const refreshTable = async () => {
    setLoading(true);
    try {
      const success = await fetchUserTokens(currentPage);
      if (!success) {
        throw new Error('Failed to refresh table');
      }
    } catch (error) {
      console.error('Error refreshing tokens:', error);
      showError(error.message || 'Error refreshing table');
    } finally {
      setLoading(false);
    }
  };

  // Add this resetForm function
  const resetForm = () => {
    // Get current user data to preserve it
    const currentUser = getCurrentUser();
    
    // Reset form while keeping user data
    setFormData({
      userId: currentUser._id || '',
      username: currentUser.username || '',
      route: currentUser.route || '',
      driverName: '',
      driverMobile: '',
      vehicleNo: '',
      vehicleType: '',
      vehicleRate: '',
      quantity: '',
      place: '',
      chalaanPin: ''
    });
  };

  // Modify confirmSubmit to use refreshTable
  const confirmSubmit = async () => {
    setIsSubmitting(true);
    try {
      const selectedVehicle = vehicleRates.find(
        vehicle => vehicle.vehicleType === formData.vehicleType
      );

      if (!selectedVehicle) {
        throw new Error('Please select a valid vehicle type');
      }
  
      // Ensure quantity is properly parsed as an integer
      const quantity = parseInt(formData.quantity);
      if (isNaN(quantity)) {
        throw new Error('Invalid quantity value');
      }
  
      const submitData = {
        userId: formData.userId,
        vehicleId: selectedVehicle.vehicleId || selectedVehicle._id, // Add fallback to _id
        driverName: formData.driverName.trim(),
        driverMobileNo: parseInt(formData.driverMobile),
        vehicleNo: formData.vehicleNo.trim(),
        vehicleType: formData.vehicleType,
        vehicleRate: parseInt(formData.vehicleRate),
        quantity: formData.quantity === "0" ? 0 : parseInt(formData.quantity), // Handle zero explicitly
        place: formData.place.trim() || undefined,
        challanPin: formData.chalaanPin ? formData.chalaanPin : undefined,
        route: formData.route
      };

      const result = await createOperatorToken(submitData);

      if (result?.status === 'success') {
        await fetchUserTokens(currentPage);
        setIsModalOpen(false);
        setShowSubmitConfirm(false);
        resetForm();
        showSuccess('Token generated successfully!');
      } else {
        throw new Error(result?.message || 'Failed to generate token');
      }
    } catch (error) {
      console.error('Error submitting token:', error);
      showError(error.message || 'Failed to create token');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelClick = () => {
    // Only check non-system fields for changes
    const formFields = {
      driverName: formData.driverName,
      driverMobile: formData.driverMobile,
      vehicleNo: formData.vehicleNo,
      vehicleType: formData.vehicleType,
      quantity: formData.quantity,
      place: formData.place,
      chalaanPin: formData.chalaanPin
    };
    
    const hasChanges = Object.values(formFields).some(value => value !== '' && value !== undefined);
    
    if (hasChanges) {
      setShowCancelConfirm(true);
    } else {
      setIsModalOpen(false);
    }
  };

  // Update handleCancelConfirm to use resetForm
  const handleCancelConfirm = () => {
    resetForm();
    setShowCancelConfirm(false);
    setIsModalOpen(false);
  };

  const handlePrint = (entry) => {
    const createQRData = (entry) => {
      return JSON.stringify({
        date: formatDateTime(entry.createdAt),
        token: entry.tokenNo,
        query: entry.route,
        cluster: '1',
        driver: entry.driverName,
        vehicle: entry.vehicleType,
        quantity: entry.quantity,
        mobile: entry.driverMobileNo,
        operator: entry.userId?.username,
        destination: entry.place,
        challan: entry.chalaanPin
      });
    };
  
    const QRCodeComponent = ({ data }) => (
      <QRCodeSVG 
        value={data}
        size={40} // Reduced QR code size
        level="M"
        includeMargin={true}
      />
    );
  
    const createCopy = (title) => {
      const qrData = createQRData(entry);
      const qrCodeSvg = ReactDOMServer.renderToString(
        <QRCodeComponent data={qrData} />
      );
  
      return `
        <div class="token-section">
          <div class="header">
            <div class="company-name">RAMJEE SINGH & COMPANY</div>
            <div class="copy-type">${title}</div>
          </div>
          <div class="content">
            <table class="info-table">
              <tr><td>Date/Time:</td><td>${formatDateTime(entry.createdAt)}</td></tr>
              <tr><td>Token No.:</td><td>${entry.tokenNo || 'N/A'}</td></tr>
              <tr><td>Query Name:</td><td>${entry.route || 'N/A'}</td></tr>
              <tr><td>Cluster:</td><td>1</td></tr>
              <tr><td>Driver Name:</td><td>${entry.driverName}</td></tr>
              <tr><td>Vehicle Type:</td><td>${entry.vehicleType}</td></tr>
              <tr><td>Vehicle No.:</td><td>${entry.vehicleNo || 'N/A'}</td></tr>
              <tr><td>Quantity:</td><td>${entry.quantity}</td></tr>
              <tr><td>Driver Mobile:</td><td>${entry.driverMobileNo}</td></tr>
              <tr><td>Operator:</td><td>${entry.userId?.username || 'N/A'}</td></tr>
              <tr><td>Destination:</td><td>${entry.place}</td></tr>
              <tr><td>Challan Pin:</td><td>${entry.chalaanPin}</td></tr>
            </table>
            <div class="qr-code">
              ${qrCodeSvg}
            </div>
          </div>
        </div>
      `;
    };
  
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Token Details</title>
          <style>
            @page {
              size: A4;
              margin: 5mm; /* Reduced margin */
            }
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              font-size: 8pt; /* Reduced font size */
              line-height: 1.1; /* Reduced line height */
            }
            .page {
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              height: 100%;
            }
            .token-section {
              padding: 3mm; /* Reduced padding */
              border: 1px solid #000;
              margin-bottom: 3mm; /* Reduced margin */
              flex: 1;
            }
            .header {
              text-align: center;
              margin-bottom: 3px; /* Reduced spacing */
            }
            .company-name {
              font-size: 10pt; /* Reduced font size */
              font-weight: bold;
            }
            .copy-type {
              font-size: 9pt; /* Reduced font size */
              font-weight: bold;
            }
            .content {
              margin-top: 3px; /* Reduced spacing */
            }
            .info-table {
              width: 100%;
              border-collapse: collapse;
            }
            .info-table td {
              padding: 2px; /* Reduced padding */
              vertical-align: top;
              font-size: 8pt; /* Reduced font size */
            }
            .info-table td:first-child {
              font-weight: bold;
              width: 30%;
            }
            .qr-code {
              margin-top: 3px; /* Reduced spacing */
              text-align: center;
            }
            .qr-code svg {
              width: 60px; /* Reduced QR code size */
              height: 60px;
            }
          </style>
        </head>
        <body>
          <div class="page">
            ${createCopy("OFFICE COPY")}
            ${createCopy("OPERATOR COPY")}
            ${createCopy("DRIVER COPY")}
          </div>
        </body>
      </html>
    `;
  
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showError('Popup was blocked. Please allow popups and try again.');
      return;
    }
  
    printWindow.document.write(printContent);
    printWindow.document.close();
  
    printWindow.onafterprint = () => {
      printWindow.close();
      window.focus(); // Return focus to the main window
    };
  
    printWindow.onerror = () => {
      showError('Error occurred while printing');
      printWindow.close();
      window.focus();
    };
  
    setTimeout(() => {
      try {
        printWindow.print();
      } catch (error) {
        console.error('Print error:', error);
        showError('Failed to print. Please try again.');
        printWindow.close();
        window.focus();
      }
    }, 500);
  };
  

  const handleReceiptPrint = (entry) => {
    const createQRData = (entry) => {
      return JSON.stringify({
        date: formatDateTime(entry.createdAt),
        token: entry.tokenNo,
        query: entry.route,
        cluster: '1',
        driver: entry.driverName,
        vehicle: entry.vehicleType, // Changed from VehicleType
        quantity: entry.quantity,
        mobile: entry.driverMobileNo,
        operator: entry.userId?.username,
        destination: entry.place,
        challan: entry.chalaanPin
      });
    };
  
    // Add compact date formatter for thermal receipts
    const formatCompactDateTime = (dateString) => {
      try {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        const hour = date.getHours() % 12 || 12;
        const minute = date.getMinutes().toString().padStart(2, '0');
        const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
        
        return `${day}/${month}/${year} ${hour}:${minute}${ampm}`;
      } catch (error) {
        console.error('Date formatting error:', error);
        return 'Invalid Date';
      }
    };

    const QRCodeComponent = ({ data }) => (
      <QRCodeSVG 
        value={data}
        size={100}  // Increased QR code size
        level="M"
        includeMargin={true}
      />
    );
  
    const createCopy = (title) => {
      const qrData = createQRData(entry);
      const qrCodeSvg = ReactDOMServer.renderToString(
        <QRCodeComponent data={qrData} />
      );
  
      return `
        <div class="receipt">
          <div class="header">
            <div class="company-name">RAMJEE SINGH & COMPANY</div>
            <div class="divider">================================</div>
            <div class="copy-label">${title}</div>
            <div class="token-number">Token No: ${entry.tokenNo || 'N/A'}</div>
            <div class="divider">================================</div>
          </div>
          <div class="content">
            <div>Date/Time: ${formatCompactDateTime(entry.createdAt)}</div>
            <div>Query Name: ${entry.route || 'N/A'}</div>
            <div>Cluster: 1</div>
            <div>Driver Name: ${entry.driverName}</div>
            <div>Vehicle Type: ${entry.vehicleType}</div>
            <div>Vehicle No: ${entry.vehicleNo || 'N/A'}</div> 
            <div>Quantity: ${entry.quantity}</div>
            <div>Driver Mobile: ${entry.driverMobileNo}</div>
            <div>Operator: ${entry.userId?.username || 'N/A'}</div>
            <div>Destination: ${entry.place || 'N/A'}</div>
            <div>Challan Pin: ${entry.chalaanPin || 'N/A'}</div>
            <div class="divider">================================</div>
          </div>
          <div class="qr-section">
            ${qrCodeSvg}
          </div>
        </div>
      `;
    };
  
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Token Receipt</title>
          <style>
            @page {
              size: 80mm auto;
              margin: 0;
              padding: 0;
            }
            body {
              font-family: 'Courier New', Courier, monospace;
              width: 80mm;
              margin: 0;
              padding: 8px;
              font-size: 12pt;
              line-height: 1.2;
              text-transform: uppercase;
              font-weight: bold; /* Added boldness */
            }
            .receipt {
              width: 100%;
              text-align: center;
              margin-bottom: 20px;
              page-break-after: always;
            }
            .receipt:last-child {
              page-break-after: avoid;
            }
            .header {
              margin-bottom: 10px;
            }
            .company-name {
              font-size: 14pt;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .copy-label {
              font-size: 14pt;
              font-weight: bold;
              margin: 5px 0;
              text-decoration: underline;
            }
            .token-number {
              font-size: 24pt;  /* Even larger font for token number */
              font-weight: bold; /* Make token number bolder */
              margin: 10px 0;
              letter-spacing: 2px;
            }
            .divider {
              margin: 5px 0;
            }
            .content {
              text-align: left;
              margin-bottom: 10px;
              font-size: 12pt;
              font-weight: bold; /* Make content text bolder */
            }
            .content div {
              margin: 3px 0;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            .qr-section {
              text-align: center;
              margin: 10px 0;
            }
            .qr-section svg {
              width: 100px;
              height: 100px;
            }
            @media print {
              body {
                width: 80mm;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          ${createCopy("OFFICE COPY")}
          ${createCopy("OPERATOR COPY")}
          ${createCopy("DRIVER COPY")}
        </body>
      </html>
    `;
  
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showError('Popup was blocked. Please allow popups and try again.');
      return;
    }

    printWindow.document.write(printContent);
    printWindow.document.close();

    printWindow.onafterprint = () => {
      printWindow.close();
      window.focus(); // Return focus to the main window
    };

    printWindow.onerror = () => {
      showError('Error occurred while printing');
      printWindow.close();
      window.focus();
    };

    setTimeout(() => {
      try {
        printWindow.print();
      } catch (error) {
        console.error('Print error:', error);
        showError('Failed to print. Please try again.');
        printWindow.close();
        window.focus();
      }
    }, 500);
  };
  

  const [users, setUsers] = useState([]);

  const [routes] = useState([
    'Route A',
    'Route B',
    'Route C',
    'Route D',
    'Route E'
  ]);

  // Add this sorting function before the return statement
  const sortedEntries = entries.sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  // Add formatDateTime function if not already present
const formatDateTime = (dateString) => {
  try {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid Date';
  }
};

  const columns = [
    {
      name: 'Actions',
      cell: row => (
        <div className="flex flex-col gap-2 py-2">
          <button
            onClick={() => handlePrint(row)}
            className="bg-gradient-to-r from-green-400 to-green-600 hover:from-green-600 hover:to-green-400 text-white px-3 py-1 rounded-full flex items-center justify-center transition duration-300 transform hover:scale-105"
          >
            L Print
          </button>
          <button
            onClick={() => handleReceiptPrint(row)}
            className="bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-600 hover:to-blue-400 text-white px-3 py-1 rounded-full flex items-center justify-center transition duration-300 transform hover:scale-105"
          >
            T Print
          </button>
        </div>
      ),
      width: '120px',
    },
    {
      name: 'Sr No.',
      cell: (row, index) => ((currentPage - 1) * perPage) + index + 1,
      width: '70px',
    },
    {
      name: 'Created Date',
      selector: row => formatDateTime(row.createdAt),
      sortable: true,
      width: '200px',
    },
    {
      name: 'Token No.',
      selector: row => row.tokenNo || 'N/A',
      sortable: true,
      width: '120px',
    },
    {
      name: 'Driver Name',
      selector: row => row.driverName,
      sortable: true,
      width: '150px',
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
      selector: row => row.place || 'N/A',
      sortable: true,
      width: '130px',
    },
    {
      name: 'Route',
      selector: row => row.route || 'N/A',
      sortable: true,
      width: '130px',
    },
    {
      name: 'Operator',
      selector: row => row.userId?.username || 'N/A',
      sortable: true,
      width: '130px',
    },
    {
      name: 'Challan Pin',
      selector: row => row.challanPin || 'N/A',
      sortable: true,
      width: '120px',
    },
    {
      name: 'Status',
      cell: row => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.isLoaded ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {row.isLoaded ? 'Loaded' : 'Pending'}
        </span>
      ),
      width: '100px',
    },
  ];

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

  return (
    <div className="p-7 max-w-7xl mx-auto">
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

      <button 
        onClick={handleAddToken}
        style={buttonStyle}
        onMouseOver={(e) => Object.assign(e.target.style, buttonHoverStyle)}
        onMouseOut={(e) => Object.assign(e.target.style, buttonStyle)}
        onMouseDown={(e) => Object.assign(e.target.style, buttonActiveStyle)}
        onMouseUp={(e) => Object.assign(e.target.style, buttonHoverStyle)}
      >
        Add Print Token
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 overflow-y-auto">
          <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-6 w-[800px] my-20 mx-auto">
            <h2 className="text-2xl font-bold text-gray-300 mb-4">Add New Token</h2>
            <form 
              onSubmit={handleSubmitClick} 
              autoComplete="off" 
              id={`form-${Math.random()}`}
            >
              <div className="grid grid-cols-2 gap-4">
                {/* Update all input containers to have consistent styling */}
                <div className="relative">
                  <label className="block text-gray-300 text-sm font-bold mb-2">User</label>
                  <div className="inline-block relative w-full">
                    <input 
                      type="text"
                      value={formData.username || ''}
                      className="block w-full px-4 py-3 bg-gray-900 text-gray-300 rounded-lg border border-gray-700 focus:outline-none cursor-not-allowed opacity-70"
                      disabled
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-gray-300 text-sm font-bold mb-2">Route</label>
                  <div className="inline-block relative w-full">
                    <input 
                      type="text"
                      value={formData.route || ''}
                      className="block w-full px-4 py-3 bg-gray-900 text-gray-300 rounded-lg border border-gray-700 focus:outline-none cursor-not-allowed opacity-70"
                      disabled
                    />
                  </div>
                </div>
                <div className="relative">
                  <label className="block text-gray-300 text-sm font-bold mb-2">Driver Name</label>
                  <div className="inline-block relative w-full">
                    <input 
                      type="text" 
                      name="driverName"
                      value={formData.driverName}
                      onChange={handleInputChange}
                      className="block w-full px-4 py-3 pr-10 bg-gray-900 text-gray-300 rounded-lg border border-gray-700 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all duration-300"
                      required
                      autoComplete="nope"
                      readOnly
                      onFocus={(e) => e.target.removeAttribute('readOnly')}
                    />
                  </div>
                </div>
                <div className="relative">
                  <label className="block text-gray-300 text-sm font-bold mb-2">Driver Mobile</label>
                  <div className="inline-block relative w-full">
                    <input 
                      type="tel" 
                      name="driverMobile"
                      value={formData.driverMobile}
                      onChange={handleInputChange}
                      maxLength={10}
                      pattern="[0-9]{10}"
                      title="Please enter a valid 10-digit mobile number"
                      className="block w-full px-4 py-3 pr-10 bg-gray-900 text-gray-300 rounded-lg border border-gray-700 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all duration-300"
                      required
                      autoComplete="nope"
                      readOnly
                      onFocus={(e) => e.target.removeAttribute('readOnly')}
                    />
                  </div>
                </div>
                <div className="relative">
                  <label className="block text-gray-300 text-sm font-bold mb-2">Vehicle No</label>
                  <div className="inline-block relative w-full">
                    <input 
                      type="text" 
                      name="vehicleNo"
                      value={formData.vehicleNo}
                      onChange={handleInputChange}
                      className="block w-full px-4 py-3 pr-10 bg-gray-900 text-gray-300 rounded-lg border border-gray-700 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all duration-300"
                      required
                      autoComplete="nope"
                      readOnly
                      onFocus={(e) => e.target.removeAttribute('readOnly')}
                    />
                  </div>
                </div>
                <div className="relative">
                  <label className="block text-gray-300 text-sm font-bold mb-2">Vehicle Type</label>
                  <div className="inline-block relative w-full">
                    <select
                      name="vehicleType"
                      value={formData.vehicleType}
                      onChange={handleInputChange}
                      className="block w-full px-4 py-3 pr-10 bg-gray-900 text-gray-300 rounded-lg border border-gray-700 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all duration-300 appearance-none"
                      required
                    >
                      <option value="">Select Vehicle Type</option>
                      {vehicleRates.map((vehicle, index) => (
                        <option 
                          key={index} 
                          value={vehicle.vehicleType}
                          className="text-gray-300 bg-gray-900"
                        >
                          {vehicle.vehicleType}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 111.414 1.414l-4 4a1 1 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <label className="block text-gray-300 text-sm font-bold mb-2">Vehicle Rate</label>
                  <div className="inline-block relative w-full">
                    <input 
                      type="text"
                      value={formData.vehicleRate}
                      className="block w-full px-4 py-3 bg-gray-900 text-gray-300 rounded-lg border border-gray-700 focus:outline-none cursor-not-allowed opacity-70"
                      disabled
                    />
                  </div>
                </div>
                <div className="relative">
                  <label className="block text-gray-300 text-sm font-bold mb-2">Quantity</label>
                  <div className="inline-block relative w-full">
                    {formData.quantity === "0" ? (
                      <input
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleInputChange}
                        min="0"
                        className="block w-full px-4 py-3 pr-10 bg-gray-900 text-gray-300 rounded-lg border border-gray-700 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all duration-300"
                        required
                      />
                    ) : (
                      <select
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleInputChange}
                        className="block w-full px-4 py-3 pr-10 bg-gray-900 text-gray-300 rounded-lg border border-gray-700 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all duration-300 appearance-none"
                        required
                      >
                        {quantityOptions.map((qty, index) => (
                          <option 
                            key={index} 
                            value={qty === "Select Quantity" ? "" : qty}
                            disabled={qty === "Select Quantity"}
                            className={`${qty === "Select Quantity" ? "text-gray-500" : "text-gray-300"} bg-gray-900`}
                          >
                            {qty}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
                <div className="relative">
                  <label className="block text-gray-300 text-sm font-bold mb-2">Place</label>
                  <div className="inline-block relative w-full">
                    <input 
                      type="text" 
                      name="place"
                      value={formData.place}
                      onChange={handleInputChange}
                      className="block w-full px-4 py-3 pr-10 bg-gray-900 text-gray-300 rounded-lg border border-gray-700 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all duration-300"
                      autoComplete="nope"
                      readOnly
                      onFocus={(e) => e.target.removeAttribute('readOnly')}
                    />
                  </div>
                </div>
                <div className="relative">
                  <label className="block text-gray-300 text-sm font-bold mb-2">Chalaan Pin</label>
                  <div className="inline-block relative w-full">
                    <input 
                      type="text" 
                      name="chalaanPin"
                      value={formData.chalaanPin}
                      onChange={handleInputChange}
                      className="block w-full px-4 py-3 pr-10 bg-gray-900 text-gray-300 rounded-lg border border-gray-700 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all duration-300"
                      autoComplete="nope"
                      readOnly
                      onFocus={(e) => e.target.removeAttribute('readOnly')}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-4">
                <button 
                  type="button"
                  onClick={handleCancelClick}
                  className="px-6 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999]">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Confirm Submission</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to submit this token?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={confirmSubmit}
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center justify-center min-w-[80px]"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                ) : (
                  'Submit'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Confirm Cancel</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to cancel? All entered data will be lost.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
              >
                No, Keep Editing
              </button>
              <button
                onClick={handleCancelConfirm}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg overflow-x-auto mt-6">
        <DataTable
          columns={columns}
          data={entries}
          pagination
          paginationServer
          paginationTotalRows={totalRows}
          paginationPerPage={perPage}
          paginationDefaultPage={currentPage}
          paginationRowsPerPageOptions={[50, 100, 200, 400, 500, 600]} // Updated pagination options
          onChangePage={handlePageChange}
          onChangeRowsPerPage={handlePerPageChange}
          progressPending={loading}
          progressComponent={
            <div className="flex justify-center items-center gap-2 p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              <span className="text-gray-500">Loading tokens...</span>
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
  )
}

export default Op_Home
