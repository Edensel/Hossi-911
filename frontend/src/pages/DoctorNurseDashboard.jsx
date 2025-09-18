import React, { useEffect, useState } from 'react';
import { Container, Typography, Box } from '@mui/material';
import { useSelector } from 'react-redux';
import { getPatients, getAppointments } from '../api/api';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

const DoctorNurseDashboard = () => {
  const user = useSelector((state) => state.auth.user);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    getPatients()
      .then((res) => setPatients(res.data))
      .catch(() => toast.error('Failed to fetch patients'));
    getAppointments()
      .then((res) => setAppointments(res.data))
      .catch(() => toast.error('Failed to fetch appointments'));
  }, []);

  return (
    <Container>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <Typography variant="h4" gutterBottom>Doctor/Nurse Dashboard</Typography>
        <Typography>Welcome, {user?.username}</Typography>
        <Box mt={2}>
          <Typography variant="h6">Your Patients</Typography>
          {patients.map((patient) => (
            <Typography key={patient.id}>{patient.name}</Typography>
          ))}
        </Box>
        <Box mt={2}>
          <Typography variant="h6">Upcoming Appointments</Typography>
          {appointments.map((appointment) => (
            <Typography key={appointment.id}>
              {appointment.appointment_date} - Patient {appointment.patient_id}
            </Typography>
          ))}
        </Box>
      </motion.div>
    </Container>
  );
};

export default DoctorNurseDashboard;