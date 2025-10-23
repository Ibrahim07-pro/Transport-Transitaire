import React from "react";
import { Snackbar, Alert, Slide } from "@mui/material";

function SlideTransition(props) {
  return <Slide {...props} direction="up" />;
}

export default function CustomSnackbar({ open, onClose, message, severity }) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={4000}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      TransitionComponent={SlideTransition}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        variant="filled"
        sx={{
          width: "100%",
          borderRadius: 2,
          fontWeight: "bold",
          fontSize: "1rem",
          boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}
