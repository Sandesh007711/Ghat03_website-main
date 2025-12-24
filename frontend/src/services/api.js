import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1`;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const loginUser = async (credentials) => {
  try {
    const response = await api.post('/users/login', credentials);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const logoutUser = async () => {
  try {
    const response = await api.get('/users/logout');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getUsers = async () => {
  try {
    const response = await api.get('/users');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getVehicleRates = async () => {
  try {
    const response = await api.get('/vehicles/get-rates');
    return {
      status: 'success',
      data: {
        rates: response.data.data.rates || []
      }
    };
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch vehicle rates' };
  }
};

export const createToken = async (tokenData) => {
  try {
    const response = await api.post('/tokens', tokenData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create token' };
  }
};

export const createUser = async (userData) => {
  try {
    const response = await api.post('/users', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateUser = async (userId, userData) => {
  try {
    const response = await api.patch(`/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getTokens = async (limit = 1000) => {
  try {
    const response = await api.get(`/tokens?limit=${limit}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateTokenLoadStatus = async (tokenId, isLoaded) => {
  try {
    const response = await api.post('/tokens/loaded', {
      _id: tokenId,
      isLoaded
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getFilteredTokens = async (params) => {
  try {
    // Convert user object to userId if present
    if (params.user && typeof params.user === 'object') {
      params = {
        ...params,
        userId: params.user._id,
      };
      delete params.user;
    }

    const queryParams = new URLSearchParams();
    
    // Add each parameter to query string
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (key === 'dateFrom' || key === 'dateTo') {
          queryParams.append(key, value);
        } else if (key === 'userId') {
          queryParams.append('user', value);
        } else {
          queryParams.append(key, value);
        }
      }
    });

    const response = await api.get(`/tokens?${queryParams}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateToken = async (tokenId, tokenData) => {
  try {
    const response = await api.patch(`/tokens/${tokenId}`, tokenData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteToken = async (tokenId) => {
  try {
    const response = await api.delete(`/tokens/${tokenId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getUpdatedTokens = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams({
      ...params,
      updated: true
    });
    const response = await api.get(`/tokens?${queryParams}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getLoadedTokens = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams({
      ...params,
      loaded: true
    });
    const response = await api.get(`/tokens?${queryParams}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getDeletedTokens = async () => {
  try {
    const response = await api.get('/tokens?deleted=true');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getVehicles = async () => {
  try {
    const response = await api.get('/vehicles');
    return {
      status: 'success',
      data: response.data.data, // Assuming the API returns { data: { vehicles: [...] } }
    };
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch vehicles' };
  }
};

export const updateVehicleRate = async (vehicleId, rate) => {
  try {
    const response = await api.patch(`/vehicles/${vehicleId}/rate`, {
      vehicleRate: rate
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update vehicle rate' };
  }
};

export const deleteVehicleRate = async (vehicleId) => {
  try {
    const response = await api.delete(`/vehicles/${vehicleId}/rate`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete vehicle rate' };
  }
};

export const createVehicleRate = async (vehicleId, rate) => {
  try {
    const response = await api.post(`/vehicles/${vehicleId}/rate`, {
      vehicleRate: rate
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create vehicle rate' };
  }
};

export const getAllVehicles = async () => {
  try {
    const response = await api.get('/vehicles');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const createVehicle = async (vehicleData) => {
  try {
    const response = await api.post('/vehicles', vehicleData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateVehicleType = async (vehicleId, vehicleData) => {
  try {
    const response = await api.patch(`/vehicles/type/${vehicleId}`, vehicleData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteVehicle = async (vehicleId) => {
  try {
    const response = await api.delete(`/vehicles/${vehicleId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const searchUnloadedTokens = async (searchTerm) => {
  try {
    const response = await api.get(`/tokens?limit=1000`);
    const data = response.data;
    
    // Extract tokens array from response
    const tokens = Array.isArray(data) ? data : 
                  (data.data && Array.isArray(data.data)) ? data.data :
                  (data.tokens && Array.isArray(data.tokens)) ? data.tokens : [];
    
    // Filter and sort tokens
    const filteredTokens = tokens.filter(t => 
      t.tokenNo.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !t.isLoaded &&
      !t.deletedAt
    ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return filteredTokens;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to search tokens' };
  }
};

export const getOperatorTokens = async (page = 1, perPage = 20) => {
  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: perPage.toString()
    });
    const response = await api.get(`/tokens?${queryParams}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch tokens' };
  }
};

export const createOperatorToken = async (tokenData) => {
  try {
    const response = await api.post('/tokens', tokenData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create token' };
  }
};

export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      throw new Error('No user data found');
    }
    const userData = JSON.parse(userStr);
    return userData.data || userData.user || userData;
  } catch (error) {
    throw new Error('Failed to get current user data');
  }
};

export const getTokenReport = async (params = {}) => {
  try {
    const { page = 1, limit = 20, fromDate, toDate } = params;
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    if (fromDate) {
      queryParams.append('dateFrom', fromDate.toISOString().split('T')[0]);
    }
    if (toDate) {
      queryParams.append('dateTo', toDate.toISOString().split('T')[0]);
    }

    const response = await api.get(`/tokens?${queryParams}`);
    
    if (response.data?.status === 'success') {
      const processedTokens = response.data.data.map(token => ({
        ...token,
        displayVehicleType: token.vehicleId?.vehicleType || token.vehicleType || 'N/A',
        displayVehicleRate: token.vehicleRate || 'N/A'
      }));

      return {
        status: 'success',
        data: processedTokens,
        totalCount: response.data.totalCount || 0
      };
    }
    
    throw new Error('Invalid response format');
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch token report' };
  }
};

export default api;
