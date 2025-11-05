import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  CircularProgress,
  Button,
  Rating,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import { getMesExpeditions, noterMission } from "../services/mesExpeditionsService";
import CustomSnackbar from "../components/CustomSnackbar";
import expeditionsImg from "../assets/containers.png";

export default function MesExpeditionsPage({ token }) {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMission, setSelectedMission] = useState(null);
  const [note, setNote] = useState(3);
  const [submitting, setSubmitting] = useState(false);

  // ✅ Snackbar pour retours utilisateur
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const primaryColor = "#FF6D00";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getMesExpeditions(token);
        setMissions(data);
      } catch (error) {
        console.error("Erreur de chargement :", error);
        setSnackbar({
          open: true,
          message: "Erreur lors du chargement des expéditions.",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  // Traduction des statuts
  const getReadableStatus = (statut) => {
  switch (statut) {
    case "ACCEPTEE": return { label: "Demande acceptée", color: "info" };
    case "CHAUFFEUR_ASSIGNE": return { label: "Chauffeur assigné", color: "secondary" };
    case "ACOMPTE_PAYE": return { label: "Acompte payé", color: "warning" };
    case "CHARGEMENT_EFFECTUE": return { label: "Chargement effectué", color: "primary" };
    case "DECHARGEMENT_EN_ATTENTE": return { label: "Déchargement en attente", color: "info" };
    case "EN_ATTENTE_PAIEMENT_SOLDE": return { label: "Paiement solde en attente", color: "warning" };
    case "TERMINEE": return { label: "Livraison terminée", color: "success" };
    case "ANNULEE": return { label: "Mission annulée", color: "error" };
    default: return { label: "En attente", color: "default" };
  }
};


  // Étape de progression
  const getProgressStep = (statut) => {
  switch (statut) {
    case "ACCEPTEE": return 0;
    case "CHAUFFEUR_ASSIGNE": return 1;
    case "ACOMPTE_PAYE": return 2;
    case "CHARGEMENT_EFFECTUE": return 3;
    case "DECHARGEMENT_EN_ATTENTE": return 4;
    case "EN_ATTENTE_PAIEMENT_SOLDE": return 5;
    case "TERMINEE": return 6;
    default: return 0;
  }
};


  // ✅ Envoi de la note
  const handleNoter = async () => {
    if (!selectedMission) return;
    setSubmitting(true);
    try {
      await noterMission(selectedMission.missionId, note, token);

      setSnackbar({
        open: true,
        message: "Merci pour votre évaluation ✅",
        severity: "success",
      });

      setSelectedMission(null);
      const data = await getMesExpeditions(token);
      setMissions(data);
    } catch (error) {
      console.error("Erreur lors de l'envoi de la note");
      setSnackbar({
        open: true,
        message: "Une erreur est survenue lors de l’envoi de la note.",
        severity: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Box sx={{ p: 3, minHeight: "100vh", backgroundColor: "#fafafa" }}>
{/* ✅ En-tête fixe */}
<Box
  sx={{
    position: "sticky",
    top: 0,
    zIndex: 10,
    backgroundColor: "#fafafa", // pour éviter que le fond soit transparent
    pb: 2,
    pt: 2,
  }}
>
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    }}
  >
    <Box
      component="img"
      src={expeditionsImg}
      alt="Expéditions"
      sx={{ width: 80, height: 80, mb: 1, objectFit: "contain" }}
    />

    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        width: "100%",
        justifyContent: "center",
        gap: 3,
        mb: 1,
      }}
    >
      <Box sx={{ flex: 1, height: 2, backgroundColor: primaryColor }} />
      <Typography
        variant="h5"
        fontWeight="bold"
        color={primaryColor}
        sx={{ whiteSpace: "nowrap" }}
      >
        MES EXPÉDITIONS
      </Typography>
      <Box sx={{ flex: 1, height: 2, backgroundColor: primaryColor }} />
    </Box>
  </Box>
</Box>


        {loading ? (
          <Box textAlign="center" mt={10}>
            <CircularProgress sx={{ color: primaryColor }} />
            <Typography color="text.secondary" mt={2}>
              Chargement de vos expéditions...
            </Typography>
          </Box>
        ) : missions.length === 0 ? (
          <Box textAlign="center" mt={10}>
            <Typography color="text.secondary">
              Aucune expédition disponible pour le moment.
            </Typography>
          </Box>
        ) : (
          <Grid
            container
            spacing={3}
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 3,
            }}
          >
            {missions.map((mission) => {
              const status = getReadableStatus(mission.statut);
              const activeStep = getProgressStep(mission.statut);

              return (
                <Box key={mission.missionId}>
                  <Card
                    sx={{
                      height: 300,
                      width: "100%",
                      borderRadius: 3,
                      boxShadow: "0px 4px 20px rgba(0,0,0,0.08)",
                      display: "flex",
                      flexDirection: "column",
                      transition: "transform 0.2s ease-in-out",
                      "&:hover": { transform: "translateY(-4px)" },
                    }}
                  >
                    <CardContent
                      sx={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        p: 2,
                      }}
                    >
                      {/* Contenu principal */}
                      <Box flex={1}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="flex-start"
                          mb={1.5}
                          spacing={1}
                        >
                          <Typography variant="subtitle2" fontWeight="bold" sx={{ flex: 1 }}>
                            {mission.adresseDepart} → {mission.adresseArrivee}
                          </Typography>
                          <Chip
                            label={status.label}
                            color={status.color}
                            size="small"
                            sx={{ fontSize: "0.7rem", flexShrink: 0 }}
                          />
                        </Stack>

                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          Type : <b>{mission.typeMarchandise}</b>
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          Poids : {mission.poidsKg} kg
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          Prix total : {mission.prixTotal.toLocaleString()} FCFA
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Acompte : {mission.montantAcompte.toLocaleString()} | Solde :{" "}
                          {mission.montantSolde.toLocaleString()}
                        </Typography>
                      </Box>

                      {/* Barre de progression et bouton */}
                      <Box mt={2}>
<Stepper 
  activeStep={activeStep} 
  alternativeLabel 
  sx={{
    "& .MuiStepLabel-label": { fontSize: "0.65rem" },
    "& .MuiStepIcon-root.Mui-active": { color: primaryColor },
    "& .MuiStepIcon-root.Mui-completed": { color: "#4CAF50" }, // vert pour étapes complétées
    "& .MuiStepIcon-root": { width: 28, height: 28 },
    "& .MuiStep-root": { padding: 0 },
  }}
>
  {["Acceptée","Chauffeur","Acompte","Chargement","Déchargement","Paiement solde","Livrée"].map((label, index) => (
    <Step key={label} completed={activeStep > index || mission.statut === "TERMINEE"}>
      <StepLabel>{label}</StepLabel>
    </Step>
  ))}
</Stepper>

{mission.statut === "TERMINEE" && !selectedMission && !mission.noted && ( // bouton caché si déjà noté
  <Button
    fullWidth
    variant="contained"
    sx={{
      mt: 1.5,
      textTransform: "none",
      borderRadius: 2,
      backgroundColor: primaryColor,
      "&:hover": { backgroundColor: "#e65c00" },
    }}
    onClick={() => setSelectedMission(mission)}
  >
    Noter la mission
  </Button>
)}

                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              );
            })}
          </Grid>
        )}

        {/* Modal de notation */}
        <Dialog open={Boolean(selectedMission)} onClose={() => setSelectedMission(null)}>
          <DialogTitle sx={{ color: primaryColor, fontWeight: "bold" }}>
            Noter la mission #{selectedMission?.missionId}
          </DialogTitle>
          <DialogContent sx={{ textAlign: "center" }}>
            <Typography mb={2}>Quelle est votre satisfaction pour cette mission ?</Typography>
            <Rating
              name="note"
              value={note}
              onChange={(e, newValue) => setNote(newValue)}
              size="large"
              precision={1}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setSelectedMission(null)} color="inherit">
              Annuler
            </Button>
            <Button
              onClick={handleNoter}
              disabled={submitting}
              variant="contained"
              sx={{
                backgroundColor: primaryColor,
                textTransform: "none",
                "&:hover": { backgroundColor: "#e65c00" },
              }}
            >
              {submitting ? "Envoi..." : "Valider"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>

      {/* ✅ Snackbar global */}
      <CustomSnackbar
        open={snackbar.open}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        severity={snackbar.severity}
      />
    </>
  );
}
