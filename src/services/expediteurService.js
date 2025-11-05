import axios from "axios";
import { BASE_URL } from "./baseUrl";

const API = `${BASE_URL}/expediteurs`;

// 📊 Récupérer les statistiques de l'expéditeur
export const getExpediteurStats = async (token) => {
  const res = await axios.get(`${API}/statistiques`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// 📝 Créer une nouvelle demande de transport
export const createDemandeTransport = async (demande, token) => {
  const res = await axios.post(`${API}/demandes`, demande, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return res.data;
};

// 💰 Récupérer les missions en attente de paiement
export const getMissionsAPayer = async (token) => {
  const res = await axios.get(`${API}/mes-expeditions`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data.filter((m) =>
    ["EN_ATTENTE_PAIEMENT_ACOMPTE", "EN_ATTENTE_PAIEMENT_SOLDE"].includes(
      m.statut.toUpperCase()
    )
  );
};

// 💳 Payer un acompte ou le solde d'une mission
export const payerMission = async (id, montant, numeroClient, otp, isAcompte, token) => {
  const endpoint = isAcompte
    ? `${API}/missions/${id}/payer-acompte`
    : `${API}/missions/${id}/payer-solde`;

  const url = `${endpoint}?montant=${montant}&numeroClient=${encodeURIComponent(numeroClient)}&otp=${encodeURIComponent(otp)}`;

  const res = await axios.post(url, {}, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};
