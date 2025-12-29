import React, { useState, useEffect } from 'react';
import { getTokens, updateTokenLoadStatus } from '../services/api';

const Loaded = () => {
  const [tokenInput, setTokenInput] = useState('');
  const [displayTokens, setDisplayTokens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleSearch = async () => {
    if (!tokenInput.trim()) {
      setError('Please enter a token number');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await getTokens();
      const tokens = Array.isArray(result) ? result : 
                    (result.data && Array.isArray(result.data)) ? result.data :
                    (result.tokens && Array.isArray(result.tokens)) ? result.tokens : [];

      // Filter tokens by token number, unloaded status and not deleted
      const matchingTokens = tokens.filter(t => 
        t.tokenNo.toLowerCase().includes(tokenInput.toLowerCase()) &&
        !t.isLoaded &&
        !t.deletedAt
      );

      if (matchingTokens.length === 0) {
        setError('No unloaded tokens found with this number');
        setDisplayTokens([]);
      } else {
        // Sort by creation date (newest first)
        const sortedTokens = matchingTokens.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        setDisplayTokens(sortedTokens);
      }
    } catch (err) {
      console.error('Error searching tokens:', err);
      setError(err.message || 'Failed to search tokens');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value.replace(/\s/g, '');
    setTokenInput(value);
  };

  const handleClick = async (selectedToken) => {
    try {
      setLoading(true);
      
      await updateTokenLoadStatus(selectedToken._id, true);

      // Remove the loaded token from both arrays
      const updatedTokens = displayTokens.filter(t => t._id !== selectedToken._id);
      setDisplayTokens(updatedTokens);
      
      setSuccessMessage('Token loaded successfully! 🎉');
    } catch (err) {
      console.error('Error loading token:', err);
      setError(err.message || 'Failed to load token');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000); // Hide after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  return (
    <div className="p-4 sm:p-7 max-w-full sm:max-w-7xl mx-auto">
      <div className="bg-gradient-to-r from-[#5A7863] via-[#90AB8B] to-[#5A7863] rounded-2xl shadow-2xl p-4 sm:p-6 mb-4">
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <input
            type="text"
            value={tokenInput}
            onChange={handleInputChange}
            placeholder="Enter token number to search"
            className="w-full sm:w-96 px-4 py-3 bg-[#EBF4DD] text-[#3B4953] rounded-lg border-2 border-[#90AB8B] focus:outline-none focus:border-[#5A7863] focus:ring-2 focus:ring-[#5A7863] transition-all duration-300"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3 rounded-md bg-[#EBF4DD] text-[#3B4953] font-bold transition duration-200 hover:bg-white hover:shadow-lg border-2 border-transparent hover:border-[#3B4953]"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 text-red-800 text-center my-4 p-3 rounded-lg font-medium">{error}</div>
      )}

      {successMessage && (
        <div className="bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-500 text-green-800 text-center my-4 p-3 rounded-lg font-medium">
          {successMessage}
        </div>
      )}

      {loading && <div className="text-center my-4 text-[#5A7863] font-medium">Searching tokens...</div>}

      {!loading && displayTokens.length === 0 && (
        <div className="text-center my-4 text-[#5A7863]">
          {tokenInput ? 'No matching tokens found' : 'No unloaded tokens available'}
        </div>
      )}

      {displayTokens.map((token, index) => (
        <div key={token._id} className="bg-gradient-to-br from-[#EBF4DD] to-white rounded-2xl shadow-2xl p-4 sm:p-6 mb-4 border-2 border-[#90AB8B]">
          <table className="w-full text-[#3B4953]">
            <thead>
              <tr className="border-b-2 border-[#90AB8B]">
                <th className="text-left p-2 font-bold text-[#3B4953]">Field</th>
                <th className="text-left p-2 font-bold text-[#3B4953]">Value</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[#90AB8B] bg-[#90AB8B] bg-opacity-20">
                <td className="p-2 font-semibold">Created Date</td>
                <td className="p-2 text-[#5A7863] font-medium">
                  {new Date(token.createdAt).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
                </td>
              </tr>
              <tr className="border-b border-[#90AB8B] bg-[#90AB8B] bg-opacity-20">
                <td className="p-2 font-semibold">Created Time</td>
                <td className="p-2 text-[#5A7863] font-medium">
                  {new Date(token.createdAt).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  })}
                </td>
              </tr>
              <tr className="border-b border-[#90AB8B]">
                <td className="p-2">Driver Name</td>
                <td className="p-2">{token.driverName}</td>
              </tr>
              <tr className="border-b border-[#90AB8B]">
                <td className="p-2">Driver Mobile</td>
                <td className="p-2">{token.driverMobileNo}</td>
              </tr>
              <tr className="border-b border-[#90AB8B]">
                <td className="p-2">Vehicle No</td>
                <td className="p-2">{token.vehicleNo}</td>
              </tr>
              <tr className="border-b border-[#90AB8B]">
                <td className="p-2">Vehicle Type</td>
                <td className="p-2">{token.vehicleType || 'N/A'}</td>
              </tr>
              <tr className="border-b border-[#90AB8B]">
                <td className="p-2">Vehicle Rate</td>
                <td className="p-2">₹{token.vehicleRate || 'N/A'}</td>
              </tr>
              <tr className="border-b border-[#90AB8B]">
                <td className="p-2">Route</td>
                <td className="p-2">{token.route}</td>
              </tr>
              <tr className="border-b border-[#90AB8B]">
                <td className="p-2">Quantity</td>
                <td className="p-2">{token.quantity}</td>
              </tr>
              <tr className="border-b border-[#90AB8B]">
                <td className="p-2">Place</td>
                <td className="p-2">{token.place}</td>
              </tr>
              <tr className="border-b border-[#90AB8B]">
                <td className="p-2">Token No</td>
                <td className="p-2">{token.tokenNo}</td>
              </tr>
              <tr className="border-b border-[#90AB8B]">
                <td className="p-2">Status</td>
                <td className="p-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      token.isLoaded 
                        ? 'bg-green-200 text-green-800' 
                        : 'bg-yellow-200 text-yellow-800'
                    }`}>
                      {token.isLoaded ? 'Loaded' : 'Pending'}
                    </span>
                    {token.pendency && (
                      <span className="bg-red-200 text-red-800 px-2 py-1 rounded-full text-xs">
                        Pendency: {token.pendency}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
              <tr className="border-b border-[#90AB8B]">
                <td className="p-2" colSpan="2">
                  <button
                    onClick={() => handleClick(token)}
                    disabled={loading}
                    className="w-full px-4 py-2 rounded-md bg-gradient-to-r from-[#90AB8B] to-[#5A7863] text-[#EBF4DD] font-bold transition duration-200 hover:from-[#5A7863] hover:to-[#3B4953]"
                  >
                    {loading ? 'Loading...' : 'Load Token'}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default Loaded;