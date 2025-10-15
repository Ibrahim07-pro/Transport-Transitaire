import axios from "axios";
import { BASE_URL } from "./baseUrl";

// Récupération des expéditions de l’expéditeur
export const getMesExpeditions = async (token) => {
  const response = await axios.get(`${BASE_URL}/expediteurs/mes-expeditions`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Noter une mission terminée
export const noterMission = async (missionId, note, token) => {
  const response = await axios.post(
    `${BASE_URL}/expediteurs/missions/${missionId}/noter?note=${note}`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};
