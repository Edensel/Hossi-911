import React, { useEffect, useState } from 'react';
import { Container, Typography, Box } from '@mui/material';
import { useSelector } from 'react-redux';
import { getAppointments } from '../api/api';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

const PatientPortal = () => {
  const user = useSelector((state) => state.auth.user);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    getAppointments()
      .then((res) => setAppointments(res.data))
      .catch(() => toast.error('Failed to fetch appointments'));
  }, []);

  return (
    <Container>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <Typography variant="h4" gutterBottom>Patient Portal</Typography>
        <Typography>Welcome, {user?.username}</Typography>
        <Box mt={2}>
          <Typography variant="h6">Your Appointments</Typography>
          {appointments.map((appointment) => (
            <Typography key={appointment.id}>
              {appointment.appointment_date} - {appointment.status}
            </Typography>
          ))}
        </Box>
      </motion.div>
    </Container>
  );
};

export default PatientPortal;