import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { useSelector } from 'react-redux';
import { getAudits } from '../api/api';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

const Audits = () => {
  const user = useSelector((state) => state.auth.user);
  const [audits, setAudits] = useState([]);

  useEffect(() => {
    if (user?.role === 'admin') {
      getAudits()
        .then((res) => setAudits(res.data))
        .catch(() => toast.error('Failed to fetch audits'));
    }
  }, [user]);

  return (
    <Container>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <Typography variant="h4" gutterBottom>Audit Logs</Typography>
        <Box mt={2}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>User ID</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Timestamp</TableCell>
                <TableCell>Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {audits.map((audit) => (
                <TableRow key={audit.id}>
                  <TableCell>{audit.id}</TableCell>
                  <TableCell>{audit.user_id}</TableCell>
                  <TableCell>{audit.action}</TableCell>
                  <TableCell>{audit.timestamp}</TableCell>
                  <TableCell>{audit.details}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </motion.div>
    </Container>
  );
};

export default Audits;