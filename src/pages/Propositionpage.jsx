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

  const renderDemandeCard = (demande) => {
    const dateStr = demande.dateSouhaitee
      ? format(new Date(demande.dateSouhaitee), "dd/MM/yyyy")
      : "Non précisée";

    return (
      <Grid item xs={12} sm={6} key={demande.id}>
        <Card
          sx={{
            width: "100%",
            borderRadius: 3,
            boxShadow: "0px 4px 20px rgba(0,0,0,0.08)",
            display: "flex",
            flexDirection: "column",
            cursor: "pointer",
            transition: "transform 0.2s ease-in-out",
            "&:hover": {
              transform: "translateY(-4px)",
            },
          }}
          onClick={() => showPropositions(demande)}
        >
          <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", gap: 2 }}>
            <Box display="flex" alignItems="center" gap={1}>
              <LocalShipping sx={{ color: primaryColor, fontSize: 28 }} />
              <Typography variant="h6" fontWeight="bold" color={primaryColor}>
                Expédition
              </Typography>
            </Box>

            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="body1" fontWeight="600">
                {demande.adresseDepart}
              </Typography>
              <TrendingFlat sx={{ color: primaryColor }} />
              <Typography variant="body1" fontWeight="600">
                {demande.adresseArrivee}
              </Typography>
            </Box>

            <Box display="flex" alignItems="center" gap={1} minHeight="32px">
              <Inventory sx={{ color: "#FF6D00", fontSize: 20 }} />
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
                  -
                </Typography>
              )}
            </Box>

            <Box textAlign="right" mt="auto">
              <Button
                size="small"
                variant="contained"
                sx={{
                  backgroundColor: primaryColor,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  "&:hover": {
                    backgroundColor: "#E65100",
                  },
                }}
              >
                Voir les propositions
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    );
  };

  return (
    <Box sx={{ p: 3, minHeight: "100vh", backgroundColor: "#fafafa" }}>
      <Box textAlign="center" mb={4}>
        <img src={deliverImg} alt="Deliver" height={100} />
        <Typography variant="h4" fontWeight="bold" color={primaryColor} mt={2}>
          PROPOSITIONS D'EXPÉDITION
        </Typography>
        <Typography variant="body1" color="text.secondary" mt={1}>
          Consultez et acceptez les meilleures offres pour vos expéditions
        </Typography>
      </Box>

      {loading ? (
        <Box textAlign="center" mt={10}>
          <CircularProgress sx={{ color: primaryColor }} size={60} />
        </Box>
      ) : demandes.length === 0 ? (
        <Box textAlign="center" mt={10}>
          <LocalShipping sx={{ fontSize: 80, color: "#ccc", mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Aucune demande en attente.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {demandes.map(renderDemandeCard)}
        </Grid>
      )}

      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 },
        }}
      >
        <DialogTitle sx={{ color: primaryColor, fontWeight: "bold", fontSize: "1.5rem" }}>
          Propositions disponibles
        </DialogTitle>

        {selectedDemande && (
          <Box sx={{ px: 3, pb: 2 }}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Typography variant="body1" fontWeight="600">
                {selectedDemande.adresseDepart}
              </Typography>
              <TrendingFlat sx={{ color: primaryColor }} />
              <Typography variant="body1" fontWeight="600">
                {selectedDemande.adresseArrivee}
              </Typography>
            </Box>
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
              Aucune proposition disponible pour le moment.
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
                        width: "100%",
                        borderRadius: 3,
                        boxShadow: "0px 4px 20px rgba(0,0,0,0.08)",
                        display: "flex",
                        flexDirection: "column",
                        transition: "transform 0.2s ease-in-out",
                        "&:hover": {
                          transform: "translateY(-4px)",
                        },
                      }}
                    >
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                          <Box>
                            <Typography variant="h6" fontWeight="bold" color={primaryColor}>
                              {prop.prixPropose} FCFA
                            </Typography>
                            <Typography variant="body1" fontWeight="600" sx={{ mt: 1 }}>
                              {prop.agenceNom}
                            </Typography>
                            <Box mt={0.5}>{buildStars(notes[prop.agenceId] || 0)}</Box>
                          </Box>
                          <Button
                            variant="contained"
                            size="medium"
                            sx={{
                              backgroundColor: primaryColor,
                              fontWeight: 600,
                              px: 3,
                              "&:hover": {
                                backgroundColor: "#E65100",
                              },
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
          <Button
            onClick={() => setModalOpen(false)}
            sx={{ color: primaryColor, fontWeight: 600 }}
          >
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}