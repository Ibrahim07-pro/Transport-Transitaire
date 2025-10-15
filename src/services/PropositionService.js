import { BASE_URL } from "./baseUrl"; // ← ton fichier avec la constante BASE_URL

export const getDemandesEnAttente = async (token) => {
  const res = await fetch(`${BASE_URL}/expediteurs/demandes/en-attente-propositions`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Erreur lors du chargement des demandes");
  return res.json();
};

export const getPropositions = async (demandeId, token) => {
  const res = await fetch(`${BASE_URL}/expediteurs/demandes/${demandeId}/propositions`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Erreur lors du chargement des propositions");
  return res.json();
};

export const getNoteMoyenne = async (agenceId, token) => {
  const res = await fetch(`${BASE_URL}/expediteurs/agences/${agenceId}/note-moyenne`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return 0;
  const data = await res.json();
  return data.noteMoyenne ?? 0;
};

export const accepterProposition = async (id, token) => {
  const res = await fetch(`${BASE_URL}/expediteurs/propositions/${id}/accepter`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Échec de l'acceptation");
  return res.json();
};
