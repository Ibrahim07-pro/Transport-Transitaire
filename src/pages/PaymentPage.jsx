import React from 'react';
import PaymentForm from '../components/PaymentForm';
import { Box, Typography } from '@mui/material';

const PaymentPage = () => {
    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h4" align="center" gutterBottom>
                Paiement Sécurisé
            </Typography>
            <PaymentForm />
        </Box>
    );
};

export default PaymentPage;
