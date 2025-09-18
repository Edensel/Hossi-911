import React, { useEffect, useState } from 'react';
import { Container, Typography, Box } from '@mui/material';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { getAppointments } from '../api/api';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

const localizer = momentLocalizer(moment);

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    getAppointments()
      .then((res) => setAppointments(res.data.map((appt) => ({
        ...appt,
        start: new Date(appt.appointment_date),
        end: new Date(appt.appointment_date),
        title: `Appointment for Patient ${appt.patient_id}`,
      }))))
      .catch(() => toast.error('Failed to fetch appointments'));
  }, []);

  return (
    <Container>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <Typography variant="h4" gutterBottom>Appointments</Typography>
        <Box mt={2} sx={{ height: '500px' }}>
          <Calendar
            localizer={localizer}
            events={appointments}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
          />
        </Box>
      </motion.div>
    </Container>
  );
};

export default Appointments;