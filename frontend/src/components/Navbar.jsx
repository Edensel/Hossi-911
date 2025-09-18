import React from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { clearAuth } from '../redux/slices/authSlice';
import { Home } from '@mui/icons-material';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const handleLogout = () => {
    dispatch(clearAuth());
    navigate('/login');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton edge="start" color="inherit" onClick={() => navigate('/')}>
          <Home />
        </IconButton>
        <Typography variant="h6" style={{ flexGrow: 1 }}>
          Hossi-911
        </Typography>
        {user && (
          <>
            <Button color="inherit" onClick={() => navigate('/dashboard')}>
              Dashboard
            </Button>
            {user.role === 'admin' && (
              <>
                <Button color="inherit" onClick={() => navigate('/branches')}>Branches</Button>
                <Button color="inherit" onClick={() => navigate('/users')}>Users</Button>
                <Button color="inherit" onClick={() => navigate('/audits')}>Audits</Button>
              </>
            )}
            <Button color="inherit" onClick={() => navigate('/patients')}>Patients</Button>
            <Button color="inherit" onClick={() => navigate('/appointments')}>Appointments</Button>
            <Button color="inherit" onClick={handleLogout}>Logout</Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;