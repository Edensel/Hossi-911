import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { useSelector } from 'react-redux';
import { getUsers } from '../api/api';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

const Users = () => {
  const user = useSelector((state) => state.auth.user);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (user?.role === 'admin') {
      getUsers()
        .then((res) => setUsers(res.data))
        .catch(() => toast.error('Failed to fetch users'));
    }
  }, [user]);

  return (
    <Container>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <Typography variant="h4" gutterBottom>Users</Typography>
        <Box mt={2}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Username</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Branch ID</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{user.branch_id}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </motion.div>
    </Container>
  );
};

export default Users;