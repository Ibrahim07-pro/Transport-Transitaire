import axios from "axios";
import { BASE_URL } from "./baseUrl";

// 🔹 Connexion
export const loginExpediteur = async (identifiant, motDePasse) => {
  try {
    const res = await axios.post(`${BASE_URL}/auth/login`, {
      identifiant,
      motDePasse,
    });
    return res.data; // { token }
  } catch (e) {
    if (e.response && e.response.status === 401) {
      throw new Error("Identifiants incorrects");
    } else if (e.message.includes("Network Error")) {
      throw new Error("Connexion impossible");
    } else {
      throw new Error("Erreur inconnue");
    }
  }
};

// 🔹 Inscription (avec upload CNIB)
export const registerExpediteur = async (formData) => {
  try {
    const res = await axios.post(`${BASE_URL}/expediteurs/register`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (e) {
    if (e.response?.data?.message) throw new Error(e.response.data.message);
    throw new Error("Erreur lors de l'inscription");
  }
};
