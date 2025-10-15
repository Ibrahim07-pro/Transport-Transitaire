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
  Alert,
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

// 🎨 Styles premium
const PremiumPaper = styled(Paper)(() => ({
  borderRadius: "16px",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.05)",
  overflow: "hidden",
  border: "1px solid rgba(0, 0, 0, 0.05)",
  background: "white",
}));

const StatCard = styled(PremiumPaper)(() => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: 24,
  textAlign: "center",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: "0 12px 40px rgba(0, 0, 0, 0.1)",
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
    width: "80px",
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
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
      setError("Impossible de charger les données");
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
      if (!isNaN(val) && val >= 0 && val <= 100) {
        updated.pourcentageSolde = (100 - val).toString();
      }
    }
    if (name === "pourcentageSolde" && value !== "") {
      const val = parseFloat(value);
      if (!isNaN(val) && val >= 0 && val <= 100) {
        updated.pourcentageAcompte = (100 - val).toString();
      }
    }

    setForm(updated);
  };

  // 📤 Soumettre une nouvelle demande
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    const acompte = parseFloat(form.pourcentageAcompte);
    const solde = parseFloat(form.pourcentageSolde);
    if (acompte + solde !== 100) {
      setError("La somme de l'acompte et du solde doit être égale à 100%");
      return;
    }

    try {
      setSubmitting(true);
      await createDemandeTransport(form, token);
      setSuccess("✅ Demande créée avec succès !");
      setTimeout(() => {
        setOpen(false);
        setSuccess("");
        resetForm();
        fetchAllData(); // Rafraîchir les stats
      }, 1500);
    } catch (err) {
      console.error(err);
      setError("❌ Échec de la création de la demande");
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
      const res = await axios.get(url, {
        headers: { "User-Agent": "TransportApp/1.0" },
      });
      setter(res.data.map((e) => e.display_name));
    } catch (err) {
      console.error("Erreur autocomplétion:", err);
      setter([]);
    }
  };

  // 💳 Composant carte de notification
  const NotificationCard = ({ mission, onPaiementReussi }) => {
    const [otpOpen, setOtpOpen] = useState(false);
    const [otp, setOtp] = useState("");
    const [processing, setProcessing] = useState(false);
    const [paiementEffectue, setPaiementEffectue] = useState(false);

    const isAcompte = mission.statut.toUpperCase() === "EN_ATTENTE_PAIEMENT_ACOMPTE";
    const montant = isAcompte ? mission.montantAcompte : mission.montantSolde;
    const OTP_CORRECT = "123456";

    const handleVerifyOtp = async () => {
      if (otp !== OTP_CORRECT) {
        setError("❌ Code OTP incorrect");
        return;
      }

      try {
        setProcessing(true);
        await payerMission(mission.missionId, montant, isAcompte, token);
        setSuccess(`✅ Paiement de ${montant} FCFA validé !`);
        setPaiementEffectue(true);
        setOtpOpen(false);
        setOtp("");
        setTimeout(() => {
          onPaiementReussi();
        }, 1000);
      } catch (err) {
        console.error(err);
        setError("❌ Erreur lors du paiement");
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
            <Typography variant="body2" color="text.secondary" mb={2} textAlign="center">
              Saisissez le code OTP pour valider le paiement de{" "}
              <strong>{montant.toLocaleString()} FCFA</strong>
            </Typography>
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
                onClick={() => setOtpOpen(false)}
                disabled={processing}
                sx={{ borderColor: primaryColor, color: primaryColor }}
              >
                Annuler
              </Button>
              <Button
                fullWidth
                variant="contained"
                onClick={handleVerifyOtp}
                disabled={processing || otp.length < 6}
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

  // 🎯 Icônes pour les stats
  const getStatIcon = (key) => {
    if (key === "livrees") return <CheckCircle sx={{ color: "#4CAF50", fontSize: 40 }} />;
    if (key === "annulees") return <Cancel sx={{ color: "#f44336", fontSize: 40 }} />;
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
      {/* Titre principal */}
      <SectionTitle variant="h4">Espace Expéditeur</SectionTitle>

      {/* Alertes globales */}
      {error && (
        <Alert severity="error" onClose={() => setError("")} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" onClose={() => setSuccess("")} sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

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
          <Grid item xs={12} sm={6} md={4} key={key}>
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

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

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

          {error && <Alert severity="error" onClose={() => setError("")} sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" onClose={() => setSuccess("")} sx={{ mb: 2 }}>{success}</Alert>}

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
    </Box>
  );
}