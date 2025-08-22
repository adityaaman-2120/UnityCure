import axios from 'axios';

// Create axios instance with base URL
const API_BASE_URL = 'http://localhost:5174/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API Service functions
export const apiService = {
  // User Authentication
  login: async (identifier, password) => {
    try {
      const response = await api.post('/login', { identifier, password });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Network error' };
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post('/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Network error' };
    }
  },

  // Hospital Management
  getHospitals: async () => {
    try {
      const response = await api.get('/hospitals');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Network error' };
    }
  },

  getHospitalById: async (id) => {
    try {
      const response = await api.get(`/hospitals/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Network error' };
    }
  },

  // Appointment Management
  createAppointment: async (appointmentData) => {
    try {
      const response = await api.post('/appointments', appointmentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Network error' };
    }
  },

  // SOS Reports
  createSOSReport: async (sosData) => {
    try {
      const response = await api.post('/sos', sosData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Network error' };
    }
  },

  // Feedback
  submitFeedback: async (feedbackData) => {
    try {
      const response = await api.post('/feedback', feedbackData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Network error' };
    }
  },

  // Provider Registration
  registerProvider: async (providerData) => {
    try {
      const response = await api.post('/providers', providerData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Network error' };
    }
  },

  // Chatbot
  sendChatMessage: async (message, userId = null) => {
    try {
      const response = await api.post('/chatbot', { message, userId });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Network error' };
    }
  },

  getChatHistory: async (userId) => {
    try {
      const response = await api.get(`/chatbot/history/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Network error' };
    }
  },

  // Contact Form
  submitContact: async (contactData) => {
    try {
      const response = await api.post('/contact', contactData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Network error' };
    }
  },
};

export default apiService;
