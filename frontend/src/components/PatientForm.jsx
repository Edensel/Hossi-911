import React from 'react';
import { TextField, Button, MenuItem, Box } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { createPatient } from '../api/api';

const PatientForm = ({ onSuccess, branches }) => {
  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
      name: '',
      dob: '',
      gender: '',
      id_number: '',
      branch_id: '',
      allergies: '',
      medical_history: '',
    },
    validationSchema: Yup.object({
      username: Yup.string().required('Required'),
      password: Yup.string().required('Required'),
      name: Yup.string().required('Required'),
      dob: Yup.date().required('Required'),
      gender: Yup.string().required('Required'),
      id_number: Yup.string().required('Required'),
      branch_id: Yup.number().required('Required'),
      allergies: Yup.string(),
      medical_history: Yup.string(),
    }),
    onSubmit: async (values) => {
      try {
        await createPatient(values);
        toast.success('Patient created successfully');
        onSuccess();
      } catch (err) {
        toast.error('Error creating patient');
      }
    },
  });

  return (
    <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 2 }}>
      <TextField
        label="Username"
        name="username"
        value={formik.values.username}
        onChange={formik.handleChange}
        error={!!formik.errors.username}
        helperText={formik.errors.username}
        margin="normal"
        fullWidth
        aria-label="Username"
      />
      <TextField
        label="Password"
        name="password"
        type="password"
        value={formik.values.password}
        onChange={formik.handleChange}
        error={!!formik.errors.password}
        helperText={formik.errors.password}
        margin="normal"
        fullWidth
        aria-label="Password"
      />
      <TextField
        label="Name"
        name="name"
        value={formik.values.name}
        onChange={formik.handleChange}
        error={!!formik.errors.name}
        helperText={formik.errors.name}
        margin="normal"
        fullWidth
        aria-label="Name"
      />
      <TextField
        label="Date of Birth"
        name="dob"
        type="date"
        value={formik.values.dob}
        onChange={formik.handleChange}
        error={!!formik.errors.dob}
        helperText={formik.errors.dob}
        margin="normal"
        fullWidth
        InputLabelProps={{ shrink: true }}
        aria-label="Date of Birth"
      />
      <TextField
        label="Gender"
        name="gender"
        select
        value={formik.values.gender}
        onChange={formik.handleChange}
        error={!!formik.errors.gender}
        helperText={formik.errors.gender}
        margin="normal"
        fullWidth
        aria-label="Gender"
      >
        <MenuItem value="Male">Male</MenuItem>
        <MenuItem value="Female">Female</MenuItem>
        <MenuItem value="Other">Other</MenuItem>
      </TextField>
      <TextField
        label="ID Number"
        name="id_number"
        value={formik.values.id_number}
        onChange={formik.handleChange}
        error={!!formik.errors.id_number}
        helperText={formik.errors.id_number}
        margin="normal"
        fullWidth
        aria-label="ID Number"
      />
      <TextField
        label="Branch"
        name="branch_id"
        select
        value={formik.values.branch_id}
        onChange={formik.handleChange}
        error={!!formik.errors.branch_id}
        helperText={formik.errors.branch_id}
        margin="normal"
        fullWidth
        aria-label="Branch"
      >
        {branches.map((branch) => (
          <MenuItem key={branch.id} value={branch.id}>
            {branch.county}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        label="Allergies"
        name="allergies"
        value={formik.values.allergies}
        onChange={formik.handleChange}
        margin="normal"
        fullWidth
        aria-label="Allergies"
      />
      <TextField
        label="Medical History"
        name="medical_history"
        value={formik.values.medical_history}
        onChange={formik.handleChange}
        margin="normal"
        fullWidth
        aria-label="Medical History"
      />
      <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
        Submit
      </Button>
    </Box>
  );
};

export default PatientForm;