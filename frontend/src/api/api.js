import axios from 'axios';
import { toast } from 'react-toastify';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      toast.error('Session expired, please log in again');
    }
    return Promise.reject(error);
  }
);

export const login = async (username, password) =>
  api.post('/login', { username, password });

export const getPatients = async () => api.get('/patients');
export const createPatient = async (data) => api.post('/patients', data);

export const getBranches = async () => api.get('/branches');
export const createBranch = async (data) => api.post('/branches', data);

export const getUsers = async () => api.get('/users');
export const createUser = async (data) => api.post('/users', data);

export const getAppointments = async () => api.get('/appointments');
export const createAppointment = async (data) => api.post('/appointments', data);

export const getAudits = async () => api.get('/audits');