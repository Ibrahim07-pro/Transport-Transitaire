import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Button,
  Modal,
  TextField,
  CircularProgress,
  Paper,
  styled,
  Autocomplete,
  Divider,
} from "@mui/material";
import { 
  Add, 
  Assignment, 
  Notifications, 
  Paid, 
  LocalShipping,
  CheckCircle,
  Cancel
} from "@mui/icons-material";
import {
  getExpediteurStats,
  createDemandeTransport,
  getMissionsAPayer,
  payerMission,
} from "../services/expediteurService";
import axios from "axios";
import CustomSnackbar from "../components/CustomSnackbar";

// 🎨 Styles premium
const PremiumPaper = styled(Paper)(() => ({
  borderRadius: "16px",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.05)",
  overflow: "hidden",
  border: "1px solid rgba(0, 0, 0, 0.05)",
  background: "white",
}));

// 🌟 Design harmonieux et premium pour les cartes de stats
const StatCard = styled(Paper)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  minHeight: 140,
  padding: theme.spacing(4),
  borderRadius: 24,
  background: "linear-gradient(135deg, #fff8f2 0%, #ffffff 100%)",
  boxShadow: "0 10px 35px rgba(255, 109, 0, 0.08)",
  transition: "all 0.3s ease",
  position: "relative",
  overflow: "hidden",
  gap: theme.spacing(1.5),
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 14px 40px rgba(255, 109, 0, 0.15)",
  },
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    height: "6px",
    borderBottomLeftRadius: "24px",
    borderBottomRightRadius: "24px",
    background: "linear-gradient(90deg, #FF6D00, #FFA000)",
  },
}));


const NotificationCardPaper = styled(PremiumPaper)(({ theme }) => ({
  padding: theme.spacing(2.5),
  marginBottom: theme.spacing(2),
  cursor: "default",
  display: "flex",
  flexDirection: "column",
  gap: 12,
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-3px)",
    boxShadow: "0 10px 30px rgba(255, 109, 0, 0.15)",
  },
}));

const SectionTitle = styled(Typography)(() => ({
  color: "#FF6D00",
  textAlign: "center",
  marginBottom: 32,
  fontWeight: 700,
  position: "relative",
  "&:after": {
    content: '""',
    display: "block",
    width: "300px",
    height: "4px",
    background: "#FF6D00",
    margin: "16px auto 0",
    borderRadius: "2px",
  },
}));

const primaryColor = "#FF6D00";

export default function ExpediteurAccueil() {
  const [stats, setStats] = useState({ livrees: 0, annulees: 0, enCours: 0 });
  const [open, setOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [missionsAPayer, setMissionsAPayer] = useState([]);

  const [form, setForm] = useState({
    adresseDepart: "",
    adresseArrivee: "",
    typeMarchandise: "",
    poidsKg: "",
    prixPropose: "",
    pourcentageAcompte: "",
    pourcentageSolde: "",
  });

  const [optionsDepart, setOptionsDepart] = useState([]);
  const [optionsArrivee, setOptionsArrivee] = useState([]);
  const token = localStorage.getItem("token");

  // 🎯 Snackbar centralisé
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  // 📊 Charger les données initiales
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [statsData, missionsData] = await Promise.all([
        getExpediteurStats(token),
        getMissionsAPayer(token),
      ]);
      setStats(statsData);
      setMissionsAPayer(missionsData);
    } catch (err) {
      console.error("Erreur lors du chargement:", err);
      setSnackbar({ open: true, message: "Impossible de charger les données", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  // 📝 Gestion des changements de formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    let updated = { ...form, [name]: value };

    // Calcul automatique acompte/solde
    if (name === "pourcentageAcompte" && value !== "") {
      const val = parseFloat(value);
      if (!isNaN(val) && val >= 0 && val <= 100) updated.pourcentageSolde = (100 - val).toString();
    }
    if (name === "pourcentageSolde" && value !== "") {
      const val = parseFloat(value);
      if (!isNaN(val) && val >= 0 && val <= 100) updated.pourcentageAcompte = (100 - val).toString();
    }

    setForm(updated);
  };

  // 📤 Soumettre une nouvelle demande
  const handleSubmit = async (e) => {
    e.preventDefault();
    const acompte = parseFloat(form.pourcentageAcompte);
    const solde = parseFloat(form.pourcentageSolde);
    if (acompte + solde !== 100) {
      setSnackbar({ open: true, message: "La somme de l'acompte et du solde doit être égale à 100%", severity: "error" });
      return;
    }

    try {
      setSubmitting(true);
      await createDemandeTransport(form, token);
      setSnackbar({ open: true, message: "✅ Demande créée avec succès !", severity: "success" });
      setTimeout(() => {
        setOpen(false);
        resetForm();
        fetchAllData();
      }, 1500);
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "❌ Échec de la création de la demande", severity: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({
      adresseDepart: "",
      adresseArrivee: "",
      typeMarchandise: "",
      poidsKg: "",
      prixPropose: "",
      pourcentageAcompte: "",
      pourcentageSolde: "",
    });
    setOptionsDepart([]);
    setOptionsArrivee([]);
  };

  // 🗺️ Autocomplétion via Nominatim
  const rechercherLieu = async (query, setter) => {
    if (!query || query.length < 3) {
      setter([]);
      return;
    }
    try {
      const encodedQuery = encodeURIComponent(query + " Burkina Faso");
      const url = `https://nominatim.openstreetmap.org/search?q=${encodedQuery}&format=json&limit=8&addressdetails=1`;

      // ✅ Ne pas mettre le header "User-Agent" côté navigateur
      const res = await axios.get(url);

      // ✅ Retourner des objets avec label + id pour éviter les doublons de key
      setter(
     res.data.map((e) => ({
      label: e.display_name,
      id: e.place_id, // place_id est unique
    }))
  );
} catch (err) {
  console.error("Erreur autocomplétion:", err);
  setter([]);
}

  };

// 💳 Notification pour paiement - SECTION CORRIGÉE
const NotificationCard = ({ mission, onPaiementReussi }) => {
  const [otpOpen, setOtpOpen] = useState(false);
  const [numeroClient, setNumeroClient] = useState("");
  const [otp, setOtp] = useState("");
  const [processing, setProcessing] = useState(false);
  const [paiementEffectue, setPaiementEffectue] = useState(false);

  const isAcompte = mission.statut.toUpperCase() === "EN_ATTENTE_PAIEMENT_ACOMPTE";
  const montant = isAcompte ? mission.montantAcompte : mission.montantSolde;
  const OTP_CORRECT = "123456";

  const handleVerifyOtp = async () => {
    if (otp !== OTP_CORRECT) {
      setSnackbar({ open: true, message: "❌ Code OTP incorrect", severity: "error" });
      return;
    }

    try {
      setProcessing(true);
      
      // ✅ CORRECTION : Ajout de numeroClient et otp comme paramètres
      await payerMission(
        mission.missionId, 
        montant, 
        numeroClient,  // ← Ajouté
        otp,          // ← Ajouté
        isAcompte, 
        token
      );
      
      setPaiementEffectue(true);
      setOtpOpen(false);
      setOtp("");
      setNumeroClient(""); // Reset du numéro
      setSnackbar({ 
        open: true, 
        message: `✅ Paiement de ${montant.toLocaleString()} FCFA validé !`, 
        severity: "success" 
      });
      setTimeout(() => onPaiementReussi(), 1000);
    } catch (err) {
      console.error(err);
      setSnackbar({ 
        open: true, 
        message: err.response?.data?.message || "❌ Erreur lors du paiement", 
        severity: "error" 
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <NotificationCardPaper>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box display="flex" alignItems="center" gap={1}>
            <LocalShipping sx={{ color: primaryColor }} />
            <Typography fontWeight="bold" variant="subtitle1">
              Mission #{mission.missionId}
            </Typography>
          </Box>
          <Button
            size="small"
            variant="contained"
            startIcon={paiementEffectue ? <CheckCircle /> : <Paid />}
            sx={{
              backgroundColor: paiementEffectue ? "#4CAF50" : primaryColor,
              "&:hover": {
                backgroundColor: paiementEffectue ? "#45a049" : "#E65100",
              },
              textTransform: "none",
              fontWeight: 600,
            }}
            onClick={() => setOtpOpen(true)}
            disabled={paiementEffectue}
          >
            {paiementEffectue ? "Payé" : "Payer"}
          </Button>
        </Box>

        <Divider />

        <Box display="flex" flexDirection="column" gap={0.5}>
          <Typography variant="body2" color="text.secondary">
            📍 <strong>Départ:</strong> {mission.adresseDepart}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            🎯 <strong>Arrivée:</strong> {mission.adresseArrivee}
          </Typography>
          <Typography variant="body2" fontWeight="bold" color={primaryColor} mt={1}>
            💰 {montant.toLocaleString()} FCFA ({isAcompte ? "Acompte" : "Solde"})
          </Typography>
        </Box>
      </NotificationCardPaper>

      {/* Modal OTP */}
      <Modal open={otpOpen} onClose={() => !processing && setOtpOpen(false)}>
        <Box
          sx={{
            backgroundColor: "white",
            p: 4,
            borderRadius: 3,
            maxWidth: 400,
            mx: "auto",
            mt: 20,
            boxShadow: "0 12px 48px rgba(0,0,0,0.3)",
          }}
        >
          <Typography
            variant="h6"
            color={primaryColor}
            fontWeight={700}
            mb={3}
            textAlign="center"
          >
            🔐 Validation du paiement
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            mb={3}
            textAlign="center"
          >
            Saisissez votre numéro et le code OTP pour valider le paiement.
          </Typography>

          {/* Montant affiché automatiquement */}
          <TextField
            fullWidth
            label="Montant à payer (FCFA)"
            value={montant.toLocaleString()}
            disabled
            margin="normal"
          />

          {/* Numéro client */}
          <TextField
            fullWidth
            label="Numéro de téléphone (client)"
            placeholder="Ex: 70XXXXXXX"
            value={numeroClient}
            onChange={(e) => setNumeroClient(e.target.value)}
            margin="normal"
            type="tel"
            disabled={processing}
            inputProps={{ maxLength: 8 }}
          />

          {/* Code OTP */}
          <TextField
            fullWidth
            label="Code OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="123456"
            margin="normal"
            disabled={processing}
            inputProps={{ maxLength: 6 }}
          />

          <Box display="flex" gap={2} mt={3}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                setOtpOpen(false);
                setNumeroClient("");
                setOtp("");
              }}
              disabled={processing}
              sx={{ borderColor: primaryColor, color: primaryColor }}
            >
              Annuler
            </Button>
            <Button
              fullWidth
              variant="contained"
              onClick={handleVerifyOtp}
              disabled={processing || otp.length < 6 || numeroClient.length < 8}
              sx={{
                backgroundColor: primaryColor,
                "&:hover": { backgroundColor: "#E65100" },
              }}
            >
              {processing ? <CircularProgress size={24} /> : "Valider"}
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
};

  const getStatIcon = (key) => {
    if (key === "livrees") return <CheckCircle sx={{ color: primaryColor, fontSize: 40 }} />;
    if (key === "annulees") return <Cancel sx={{ color: primaryColor, fontSize: 40 }} />;
    return <Assignment sx={{ color: primaryColor, fontSize: 40 }} />;
  };

  const getStatLabel = (key) => {
    if (key === "livrees") return "Livrées";
    if (key === "annulees") return "Annulées";
    return "En cours";
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "70vh",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <CircularProgress size={60} sx={{ color: primaryColor }} />
        <Typography color="text.secondary">Chargement...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: "auto" }}>
      <SectionTitle variant="h4">Espace Expéditeur</SectionTitle>

      {/* Boutons d'action */}
      <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mb: 5, flexWrap: "wrap" }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpen(true)}
          sx={{
            backgroundColor: primaryColor,
            "&:hover": { backgroundColor: "#E65100" },
            px: 3,
            py: 1.2,
            fontWeight: 600,
            textTransform: "none",
          }}
        >
          Créer une Demande
        </Button>
        <Button
          variant="outlined"
          startIcon={<Notifications />}
          onClick={() => setNotifOpen(true)}
          sx={{
            borderColor: primaryColor,
            color: primaryColor,
            px: 3,
            py: 1.2,
            fontWeight: 600,
            textTransform: "none",
            "&:hover": { borderColor: "#E65100", backgroundColor: "rgba(255, 109, 0, 0.05)" },
          }}
        >
          Notifications {missionsAPayer.length > 0 && `(${missionsAPayer.length})`}
        </Button>
      </Box>

      {/* Statistiques */}
      <SectionTitle variant="h5">Mes Statistiques</SectionTitle>
      <Grid container spacing={3} justifyContent="center" sx={{ mb: 5 }}>
        {Object.entries(stats).map(([key, value]) => (
          <Grid 
          container 
          spacing={{ xs: 3, sm: 4, md: 5 }} 
          justifyContent="center" 
          alignItems="stretch" 
          sx={{ mb: 6 }}
        >

            <StatCard>
              <Box display="flex" alignItems="center" mb={2}>
                {getStatIcon(key)}
              </Box>
              <Typography variant="h6" sx={{ color: primaryColor, fontWeight: 700, mb: 1 }}>
                {getStatLabel(key)}
              </Typography>
              <Typography sx={{ fontSize: "2.5rem", fontWeight: 800, color: primaryColor }}>
                {value}
              </Typography>
            </StatCard>
          </Grid>
        ))}
      </Grid>

      {/* Modals et CustomSnackbar */}
      {/* Modal création demande */}
      <Modal open={open} onClose={() => !submitting && setOpen(false)}>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            backgroundColor: "#fff",
            borderRadius: "20px",
            p: 4,
            maxWidth: 700,
            mx: "auto",
            mt: { xs: 2, md: 8 },
            maxHeight: "95vh",
            overflowY: "auto",
            boxShadow: "0 16px 48px rgba(0,0,0,0.3)",
          }}
        >
          {/* En-tête */}
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <Add sx={{ color: primaryColor, fontSize: 35 }} />
            <Typography variant="h5" fontWeight={700} color={primaryColor}>
              Nouvelle Demande
            </Typography>
          </Box>

          {/* Itinéraire */}
          <Box mb={3}>
            <Typography variant="subtitle2" fontWeight={600} color="text.secondary" mb={1.5}>
              📍 Itinéraire
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <Autocomplete
                freeSolo
                options={optionsDepart}
                value={form.adresseDepart}
                onInputChange={(_, value) => {
                  setForm({ ...form, adresseDepart: value });
                  rechercherLieu(value, setOptionsDepart);
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Adresse de départ" required fullWidth />
                )}
                disabled={submitting}
              />
              <Autocomplete
                freeSolo
                options={optionsArrivee}
                value={form.adresseArrivee}
                onInputChange={(_, value) => {
                  setForm({ ...form, adresseArrivee: value });
                  rechercherLieu(value, setOptionsArrivee);
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Adresse d'arrivée" required fullWidth />
                )}
                disabled={submitting}
              />
            </Box>
          </Box>

          {/* Marchandise */}
          <Box mb={3}>
            <Typography variant="subtitle2" fontWeight={600} color="text.secondary" mb={1.5}>
              📦 Marchandise
            </Typography>
            <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} gap={2}>
              <TextField
                label="Type de marchandise"
                name="typeMarchandise"
                value={form.typeMarchandise}
                onChange={handleChange}
                fullWidth
                required
                disabled={submitting}
              />
              <TextField
                label="Poids (Kg)"
                name="poidsKg"
                value={form.poidsKg}
                onChange={handleChange}
                type="number"
                fullWidth
                required
                disabled={submitting}
                sx={{ maxWidth: { sm: 200 } }}
                inputProps={{ min: 0.1, step: 0.1 }}
              />
            </Box>
          </Box>

          {/* Paiement */}
          <Box mb={3}>
            <Typography variant="subtitle2" fontWeight={600} color="text.secondary" mb={1.5}>
              💰 Modalités de paiement
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <TextField
                label="Prix proposé (FCFA)"
                name="prixPropose"
                value={form.prixPropose}
                onChange={handleChange}
                type="number"
                fullWidth
                required
                disabled={submitting}
                inputProps={{ min: 1, step: 1 }}
              />
              <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} gap={2}>
                <TextField
                  label="Acompte (%)"
                  name="pourcentageAcompte"
                  value={form.pourcentageAcompte}
                  onChange={handleChange}
                  type="number"
                  fullWidth
                  required
                  disabled={submitting}
                  inputProps={{ min: 0, max: 100, step: 1 }}
                />
                <TextField
                  label="Solde (%)"
                  name="pourcentageSolde"
                  value={form.pourcentageSolde}
                  onChange={handleChange}
                  type="number"
                  fullWidth
                  required
                  disabled={submitting}
                  inputProps={{ min: 0, max: 100, step: 1 }}
                />
              </Box>
            </Box>
          </Box>

          {/* Boutons */}
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              onClick={() => setOpen(false)}
              fullWidth
              disabled={submitting}
              sx={{ borderColor: primaryColor, color: primaryColor }}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={submitting}
              sx={{
                backgroundColor: primaryColor,
                color: "#fff",
                fontWeight: 700,
                py: 1.5,
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "#E65100",
                  transform: "scale(1.02)",
                },
              }}
            >
              {submitting ? <CircularProgress size={24} /> : "Envoyer la Demande"}
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Modal notifications */}
      <Modal open={notifOpen} onClose={() => setNotifOpen(false)}>
        <Box
          sx={{
            backgroundColor: "white",
            p: 3,
            borderRadius: 3,
            maxWidth: 650,
            mx: "auto",
            mt: { xs: 2, md: 8 },
            maxHeight: "90vh",
            overflowY: "auto",
            boxShadow: "0 12px 48px rgba(0,0,0,0.3)",
          }}
        >
          <Typography
            variant="h6"
            color={primaryColor}
            fontWeight={700}
            mb={3}
            textAlign="center"
          >
            🔔 Notifications de Paiement
          </Typography>

          {missionsAPayer.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Notifications sx={{ fontSize: 60, color: "text.disabled", mb: 2 }} />
              <Typography color="text.secondary">
                Aucune notification de paiement disponible
              </Typography>
            </Box>
          ) : (
            missionsAPayer.map((m) => (
              <NotificationCard
                key={m.missionId}
                mission={m}
                onPaiementReussi={fetchAllData}
              />
            ))
          )}
        </Box>
      </Modal>

      {/* CustomSnackbar */}
      <CustomSnackbar
        open={snackbar.open}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        severity={snackbar.severity}
      />
    </Box>
  );
}
