import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginExpediteur from "./pages/LoginExpediteur";
import RegisterExpediteur from "./pages/RegisterExpediteur";
import ExpediteurAccueil from "./pages/HomeExpediteur";
import MesExpeditionsPage from "./pages/MesExpeditionsPage";
import DemandesEnAttentePage from "./pages/Propositionpage"; // ✅ nouvelle page
import Layout from "./components/Layout";

// 🔒 Route protégée (redirige vers la page de connexion si pas de token)
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* 🔸 Pages publiques (non connectées) */}
        <Route path="/" element={<LoginExpediteur />} />
        <Route path="/register" element={<RegisterExpediteur />} />

        {/* 🔹 Pages protégées avec Layout */}
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <Layout>
                <ExpediteurAccueil />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/mes-expeditions"
          element={
            <PrivateRoute>
              <Layout>
                <MesExpeditionsPage token={localStorage.getItem("token")} />
              </Layout>
            </PrivateRoute>
          }
        />

        {/* 🔹 Page Demandes en attente (protégée) */}
        <Route
          path="/demandes-en-attente"
          element={
            <PrivateRoute>
              <Layout>
                <DemandesEnAttentePage token={localStorage.getItem("token")} />
              </Layout>
            </PrivateRoute>
          }
        />

        {/* 🔸 Redirection par défaut vers connexion */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
