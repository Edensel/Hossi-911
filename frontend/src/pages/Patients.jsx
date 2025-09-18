import React, { useEffect, useState } from 'react';
import { Container, Typography, Button, Box, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { useSelector } from 'react-redux';
import { getPatients, getBranches } from '../api/api';
import PatientForm from '../components/PatientForm';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

const Patients = () => {
  const user = useSelector((state) => state.auth.user);
  const [patients, setPatients] = useState([]);
  const [branches, setBranches] = useState([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    getPatients()
      .then((res) => setPatients(res.data))
      .catch(() => toast.error('Failed to fetch patients'));
    getBranches()
      .then((res) => setBranches(res.data))
      .catch(() => toast.error('Failed to fetch branches'));
  }, []);

  return (
    <Container>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <Typography variant="h4" gutterBottom>Patients</Typography>
        {user?.role === 'admin' && (
          <Button variant="contained" color="primary" onClick={() => setShowForm(true)} sx={{ mb: 2 }}>
            Add Patient
          </Button>
        )}
        {showForm && <PatientForm onSuccess={() => setShowForm(false)} branches={branches} />}
        <Box mt={2}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>DOB</TableCell>
                <TableCell>Gender</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {patients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell>{patient.id}</TableCell>
                  <TableCell>{patient.name}</TableCell>
                  <TableCell>{patient.dob}</TableCell>
                  <TableCell>{patient.gender}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </motion.div>
    </Container>
  );
};

export default Patients;