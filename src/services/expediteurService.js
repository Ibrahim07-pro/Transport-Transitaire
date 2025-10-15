import axios from "axios";
import { BASE_URL } from "./baseUrl";

const API = `${BASE_URL}/expediteurs`;

export const getExpediteurStats = async (token) => {
  const res = await axios.get(`${API}/statistiques`, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};

export const createDemandeTransport = async (demande, token) => {
  const res = await axios.post(`${API}/demandes`, demande, {
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
  return res.data;
};

export const getMissionsAPayer = async (token) => {
  const res = await axios.get(`${API}/mes-expeditions`, { headers: { Authorization: `Bearer ${token}` } });
  return res.data.filter(
    (m) => ["EN_ATTENTE_PAIEMENT_ACOMPTE", "EN_ATTENTE_PAIEMENT_SOLDE"].includes(m.statut.toUpperCase())
  );
};

export const payerMission = async (id, montant, isAcompte, token) => {
  const url = isAcompte
    ? `${API}/missions/${id}/payer-acompte?montant=${montant}`
    : `${API}/missions/${id}/payer-solde?montant=${montant}`;
  const res = await axios.post(url, {}, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};
