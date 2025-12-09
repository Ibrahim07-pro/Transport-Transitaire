import React, { useState } from 'react';
import { initiatePayment } from '../services/paymentService';
import ReactFlagsSelect from "react-flags-select";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { Box, Button, TextField, Typography, Alert, CircularProgress } from '@mui/material';

const PaymentForm = () => {
    // Default values matching backend API specification
    const [formData, setFormData] = useState({
        missionId: '1',
        type: 'ACOMPTE',
        mode: 'MOBILE_MONEY',
        customerMsisdn: '+22664710309',
        otp: '', // User must enter
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(false);

    // Phone input handler
    const handlePhoneChange = (value, field) => {
        // Ensure '+' is present if not added by library
        const formatted = value.startsWith('+') ? value : '+' + value;
        setFormData(prev => ({ ...prev, [field]: formatted }));
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        setError(false);

        try {
            const response = await initiatePayment(formData);
            setMessage('Paiement initié avec succès ! Réponse: ' + JSON.stringify(response));
        } catch (err) {
            setError(true);
            setMessage(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 400, mx: 'auto', p: 3, border: '1px solid #ddd', borderRadius: 2, mt: 5 }}>
            <Typography variant="h5" gutterBottom>
                Paiement
            </Typography>

            {message && (
                <Alert severity={error ? "error" : "success"} sx={{ mb: 2 }}>
                    {message}
                </Alert>
            )}

            <form onSubmit={handleSubmit}>

                <TextField
                    fullWidth
                    label="ID de Mission"
                    name="missionId"
                    value={formData.missionId}
                    onChange={handleChange}
                    margin="normal"
                    required
                />



                <Box sx={{ mb: 2, mt: 2 }}>
                    <Typography variant="body2" gutterBottom>Numéro du client (Expéditeur)</Typography>
                    <PhoneInput
                        country={"bf"}
                        value={formData.customerMsisdn.replace('+', '')}
                        onChange={(phone) => handlePhoneChange(phone, 'customerMsisdn')}
                        inputStyle={{ width: '100%' }}
                    />
                </Box>

                <TextField
                    fullWidth
                    label="Code OTP"
                    name="otp"
                    value={formData.otp}
                    onChange={handleChange}
                    margin="normal"
                    helperText="Entrez le code OTP (ex: 123456)"
                    required
                />

                {/* Hidden fields / Read-only for debug or fixed values */}
                <Box sx={{ display: 'none' }}>
                    <input type="hidden" name="type" value={formData.type} />
                    <input type="hidden" name="mode" value={formData.mode} />
                </Box>

                <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={loading}
                    sx={{ mt: 2 }}
                >
                    {loading ? <CircularProgress size={24} /> : 'Payer maintenant'}
                </Button>
            </form>
        </Box>
    );
};

export default PaymentForm;
