import React, { useEffect, useState } from 'react';
import { Container, Typography, Box } from '@mui/material';
import { useSelector } from 'react-redux';
import { getPatients, getBranches } from '../api/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const user = useSelector((state) => state.auth.user);
  const [patients, setPatients] = useState([]);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    getPatients()
      .then((res) => {
        setPatients(res.data);
        const branchCounts = res.data.reduce((acc, patient) => {
          const branchId = patient.branch_id || 'Unknown';
          acc[branchId] = (acc[branchId] || 0) + 1;
          return acc;
        }, {});
        setChartData(Object.entries(branchCounts).map(([branch_id, patients]) => ({ branch_id, patients })));
      })
      .catch(() => toast.error('Failed to fetch patients'));
  }, []);

  return (
    <Container>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <Typography variant="h4" gutterBottom>Admin Dashboard</Typography>
        <Typography>Welcome, {user?.username}</Typography>
        <Box mt={2}>
          <Typography variant="h6">Patients per Branch</Typography>
          <BarChart width={600} height={300} data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="branch_id" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="patients" fill="#006600" />
          </BarChart>
        </Box>
      </motion.div>
    </Container>
  );
};

export default AdminDashboard;