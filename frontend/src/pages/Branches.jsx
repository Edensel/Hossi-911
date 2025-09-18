import React, { useEffect, useState } from 'react';
import { Container, Typography, Box } from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { getBranches } from '../api/api';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const Branches = () => {
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    getBranches()
      .then((res) => setBranches(res.data))
      .catch(() => toast.error('Failed to fetch branches'));
  }, []);

  const branchCoordinates = {
    Nairobi: [-1.286389, 36.817223],
    Mombasa: [-4.043477, 39.668206],
    Kisumu: [-0.091702, 34.767956],
    Nakuru: [-0.303099, 36.080026],
    // Add more counties
  };

  return (
    <Container>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <Typography variant="h4" gutterBottom>Branches</Typography>
        <Box mt={2} sx={{ height: '400px' }}>
          <MapContainer center={[-1.286389, 36.817223]} zoom={6} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {branches.map((branch) => (
              <Marker
                key={branch.id}
                position={branchCoordinates[branch.county] || [-1.286389, 36.817223]}
              >
                <Popup>
                  {branch.county}: {branch.location}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </Box>
        <Box mt={2}>
          <Typography variant="h6">Branch List</Typography>
          {branches.map((branch) => (
            <Typography key={branch.id}>
              {branch.county}: {branch.location}, {branch.contact}, Capacity: {branch.capacity}
            </Typography>
          ))}
        </Box>
      </motion.div>
    </Container>
  );
};

export default Branches;