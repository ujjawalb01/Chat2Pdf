import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const generatePDF = async (url) => {
  try {
    const response = await api.post('/pdf/generate', { url });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data && error.response.data.error) {
      throw new Error(error.response.data.error.message);
    }
    throw new Error('Failed to connect to the server.');
  }
};

export const getPreviewUrl = (id) => {
  return `${API_URL}/pdf/preview/${id}`;
};

export const getDownloadUrl = (id, title) => {
  const query = title ? `?title=${encodeURIComponent(title)}` : '';
  return `${API_URL}/pdf/download/${id}${query}`;
};
