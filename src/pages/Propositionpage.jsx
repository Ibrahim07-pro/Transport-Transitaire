import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Rating,
  Chip,
  Divider,
} from "@mui/material";
import {
  LocalShipping,
  Inventory,
  CalendarToday,
  TrendingFlat,
} from "@mui/icons-material";
import {
  getDemandesEnAttente,
  getPropositions,
  getNoteMoyenne,
  accepterProposition,
} from "../services/PropositionService";
import deliverImg from "../assets/delivery-box.png";
import { format } from "date-fns";

export default function DemandesEnAttentePage({ token }) {
  const primaryColor = "#FF6D00";
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPropositions, setSelectedPropositions] = useState([]);
  const [selectedDemande, setSelectedDemande] = useState(null);
  const [notes, setNotes] = useState({});
  const [modalOpen, setModalOpen] = useState(false);

  const fetchDemandes = async () => {
    setLoading(true);
    try {
      const data = await getDemandesEnAttente(token);
      setDemandes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemandes();
  }, []);

  const showPropositions = async (demande) => {
    try {
      const propositions = await getPropositions(demande.id, token);
      const notesMap = {};
      for (const prop of propositions) {
        notesMap[prop.agenceId] = await getNoteMoyenne(prop.agenceId, token);
      }
      setNotes(notesMap);
      setSelectedPropositions(propositions);
      setSelectedDemande(demande);
      setModalOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAccepter = async (id) => {
    try {
      await accepterProposition(id, token);
      setModalOpen(false);
      fetchDemandes();
    } catch (err) {
      console.error(err);
    }
  };

  const buildStars = (note) => (
    <Rating name="read-only" value={note} precision={0.5} readOnly size="small" />
  );

  const renderDemandeCard = (demande) => (
    <Grid item xs={12} sm={6} key={demande.id}>
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: "0px 4px 20px rgba(0,0,0,0.08)",
          cursor: "pointer",
          transition: "transform 0.2s ease-in-out",
          "&:hover": { transform: "translateY(-4px)" },
        }}
        onClick={() => showPropositions(demande)}
      >
        <CardContent sx={{ p: 2 }}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <LocalShipping sx={{ color: primaryColor, fontSize: 26 }} />
            <Typography variant="h6" fontWeight="bold" color={primaryColor}>
              Expédition
            </Typography>
          </Box>

          <Typography variant="subtitle2" fontWeight="600">
            {demande.adresseDepart} → {demande.adresseArrivee}
          </Typography>

          <Box display="flex" alignItems="center" gap={1} mt={1}>
            <Inventory sx={{ color: "#FF6D00", fontSize: 18 }} />
            {demande.typeMarchandise ? (
              <Chip
                label={demande.typeMarchandise}
                size="small"
                sx={{
                  backgroundColor: "#FFF3E0",
                  color: primaryColor,
                  fontWeight: 600,
                }}
              />
            ) : (
              <Typography variant="body2" color="text.secondary">
                Type non précisé
              </Typography>
            )}
          </Box>

          <Box textAlign="right" mt={2}>
            <Button
              size="small"
              variant="contained"
              sx={{
                backgroundColor: primaryColor,
                textTransform: "none",
                borderRadius: 2,
                px: 3,
                "&:hover": { backgroundColor: "#E65100" },
              }}
            >
              Voir les propositions
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Grid>
  );

  return (
    <Box sx={{ p: 3, minHeight: "100vh", backgroundColor: "#fafafa" }}>
      {/* ✅ En-tête avec image et lignes décoratives */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Box
          component="img"
          src={deliverImg}
          alt="Expéditions"
          sx={{ width: 80, height: 80, mb: 2, objectFit: "contain" }}
        />

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            justifyContent: "center",
            gap: 3,
            mb: 2,
          }}
        >
          <Box sx={{ flex: 1, height: 2, backgroundColor: primaryColor }} />
          <Typography
            variant="h5"
            fontWeight="bold"
            color={primaryColor}
            sx={{ whiteSpace: "nowrap" }}
          >
            PROPOSITIONS D’EXPÉDITION
          </Typography>
          <Box sx={{ flex: 1, height: 2, backgroundColor: primaryColor }} />
        </Box>

        <Typography variant="body1" color="text.secondary">
          Consultez et acceptez les meilleures offres pour vos expéditions
        </Typography>
      </Box>

      {/* ✅ Contenu principal */}
      {loading ? (
        <Box textAlign="center" mt={10}>
          <CircularProgress sx={{ color: primaryColor }} />
          <Typography color="text.secondary" mt={2}>
            Chargement des propositions...
          </Typography>
        </Box>
      ) : demandes.length === 0 ? (
        <Box textAlign="center" mt={10}>
          <LocalShipping sx={{ fontSize: 80, color: "#ccc", mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Aucune demande en attente pour le moment.
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
          {demandes.map(renderDemandeCard)}
        </Grid>
      )}

      {/* ✅ Modal des propositions */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ color: primaryColor, fontWeight: "bold" }}>
          Propositions disponibles
        </DialogTitle>

        {selectedDemande && (
          <Box sx={{ px: 3, pb: 2 }}>
            <Typography variant="subtitle1" fontWeight="600" mb={1}>
              {selectedDemande.adresseDepart} → {selectedDemande.adresseArrivee}
            </Typography>
            {selectedDemande.typeMarchandise && (
              <Chip
                label={selectedDemande.typeMarchandise}
                size="small"
                sx={{
                  backgroundColor: "#FFF3E0",
                  color: primaryColor,
                  fontWeight: 600,
                }}
              />
            )}
          </Box>
        )}

        <Divider />

        <DialogContent dividers sx={{ p: 3 }}>
          {selectedPropositions.length === 0 ? (
            <Typography textAlign="center" color="text.secondary">
              Aucune proposition disponible.
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {selectedPropositions.map((prop) => {
                const dateStr = prop.dateExpiration
                  ? format(new Date(prop.dateExpiration), "dd/MM/yyyy")
                  : "Non précisée";
                return (
                  <Grid item xs={12} key={prop.id}>
                    <Card
                      sx={{
                        borderRadius: 3,
                        boxShadow: "0px 4px 20px rgba(0,0,0,0.08)",
                        transition: "transform 0.2s ease-in-out",
                        "&:hover": { transform: "translateY(-4px)" },
                      }}
                    >
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="start" mb={1.5}>
                          <Box>
                            <Typography variant="body1" fontWeight="600">
                              {prop.agenceNom}
                            </Typography>
                            <Box mt={0.5}>{buildStars(notes[prop.agenceId] || 0)}</Box>
                          </Box>
                          <Button
                            variant="contained"
                            size="medium"
                            sx={{
                              backgroundColor: primaryColor,
                              textTransform: "none",
                              borderRadius: 2,
                              "&:hover": { backgroundColor: "#E65100" },
                            }}
                            onClick={() => handleAccepter(prop.id)}
                          >
                            Accepter
                          </Button>
                        </Box>
                        <Divider sx={{ my: 1.5 }} />
                        <Box display="flex" alignItems="center" gap={1}>
                          <CalendarToday sx={{ fontSize: 18, color: "#666" }} />
                          <Typography variant="body2" color="text.secondary">
                            Expire le : {dateStr}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setModalOpen(false)} sx={{ color: primaryColor, fontWeight: 600 }}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
