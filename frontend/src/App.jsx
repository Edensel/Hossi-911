import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Provider } from 'react-redux';
import store from './redux/store';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import DoctorNurseDashboard from './pages/DoctorNurseDashboard';
import PatientPortal from './pages/PatientPortal';
import Branches from './pages/Branches';
import Users from './pages/Users';
import Patients from './pages/Patients';
import Appointments from './pages/Appointments';
import Audits from './pages/Audits';
import theme from './theme';

const App = () => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<AdminDashboard />} />
            <Route path="/doctor-nurse" element={<DoctorNurseDashboard />} />
            <Route path="/patient" element={<PatientPortal />} />
            <Route path="/branches" element={<Branches />} />
            <Route path="/users" element={<Users />} />
            <Route path="/patients" element={<Patients />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/audits" element={<Audits />} />
            <Route path="/" element={<Login />} />
          </Routes>
          <ToastContainer />
        </Router>
      </ThemeProvider>
    </Provider>
  );
};

export default App;