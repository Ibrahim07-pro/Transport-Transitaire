import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

import LoginExpediteur from "./pages/LoginExpediteur";
import RegisterExpediteur from "./pages/RegisterExpediteur";
import ExpediteurAccueil from "./pages/HomeExpediteur";
import MesExpeditionsPage from "./pages/MesExpeditionsPage";
import DemandesEnAttentePage from "./pages/Propositionpage";
import PaymentPage from "./pages/PaymentPage";
import Layout from "./components/Layout";

// 🔒 Route protégée (vérifie le token avant d’autoriser l’accès)
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/" replace />;
};

// 🚪 Gestion automatique de la déconnexion et du retour
function TokenWatcher() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    // Si l’utilisateur tente d’aller sur une page protégée sans token
    const isProtectedRoute =
      location.pathname !== "/" && location.pathname !== "/register";

    if (isProtectedRoute && !token) {
      navigate("/", { replace: true });
    }

    // Si connecté, bloquer le retour à la page de login
    if (token && (location.pathname === "/" || location.pathname === "/register")) {
      navigate("/home", { replace: true });
    }
  }, [location, navigate]);

  return null;
}

function App() {
  return (
    <Router>
      {/* 👁️ Surveille le token et les changements de page */}
      <TokenWatcher />

      <Routes>
        {/* 🔸 Pages publiques */}
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

        <Route
          path="/payment"
          element={
            <PrivateRoute>
              <Layout>
                <PaymentPage />
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
