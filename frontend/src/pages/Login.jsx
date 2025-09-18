import React from 'react';
import { TextField, Button, Container, Typography, Box } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { login } from '../api/api';
import { setAuth } from '../redux/slices/authSlice';
import { motion } from 'framer-motion';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const formik = useFormik({
    initialValues: { username: '', password: '' },
    validationSchema: Yup.object({
      username: Yup.string().required('Required'),
      password: Yup.string().required('Required'),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const response = await login(values.username, values.password);
        dispatch(setAuth({
          token: response.data.access_token,
          user: { id: 1, username: values.username, role: 'admin', branch_id: 1 }
        }));
        toast.success('Login successful');
        navigate('/dashboard');
      } catch (err) {
        toast.error('Invalid credentials');
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <Container maxWidth="sm">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <Box mt={5}>
          <Typography variant="h4" gutterBottom align="center">
            Login to Hossi-911
          </Typography>
          <form onSubmit={formik.handleSubmit}>
            <TextField
              fullWidth
              label="Username"
              name="username"
              value={formik.values.username}
              onChange={formik.handleChange}
              error={!!formik.errors.username}
              helperText={formik.errors.username}
              margin="normal"
              aria-label="Username"
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              error={!!formik.errors.password}
              helperText={formik.errors.password}
              margin="normal"
              aria-label="Password"
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2 }}
              disabled={formik.isSubmitting}
            >
              Login
            </Button>
          </form>
        </Box>
      </motion.div>
    </Container>
  );
};

export default Login;