import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import animationData from "../assets/truck.json";
import { loginExpediteur } from "../services/authServiceExpediteur";
import CustomSnackbar from "../components/CustomSnackbar";

export default function LoginExpediteur() {
  const [identifiant, setIdentifiant] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const navigate = useNavigate();

  // 🚫 Supprimer le token à chaque ouverture de la page login
  // ✅ Et rediriger seulement si un token encore valide existe (sécurité)
  useEffect(() => {
    localStorage.removeItem("token"); // On efface toujours le token dès qu'on revient ici
  }, []);

  // ✅ Fonction de connexion
  const handleLogin = async () => {
    if (!identifiant || !motDePasse) {
      setSnackbar({
        open: true,
        message: "Veuillez remplir tous les champs",
        severity: "warning",
      });
      return;
    }

    setLoading(true);
    try {
      const data = await loginExpediteur(identifiant, motDePasse);

      // Stocker le token dans le localStorage
      localStorage.setItem("token", data.token);

      // Afficher message succès
      setSnackbar({
        open: true,
        message: "Connexion réussie ✅",
        severity: "success",
      });

      // Rediriger après un court délai
      setTimeout(() => {
        navigate("/home", { replace: true });
      }, 1000);
    } catch (e) {
      setSnackbar({
        open: true,
        message: e.message || "Erreur de connexion. Vérifiez vos identifiants.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Style général
  const styles = {
    container: {
      display: "flex",
      minHeight: "100vh",
      fontFamily: "Arial, sans-serif",
    },
    leftPanel: {
      flex: 1,
      backgroundColor: "#ff8800",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    rightPanel: {
      flex: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#f5f5f5",
    },
    formBox: {
      width: "100%",
      maxWidth: 400,
      background: "#fff",
      padding: 40,
      borderRadius: 16,
      boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
      textAlign: "center",
      animation: "fadeIn 0.6s ease-in-out",
    },
    h1: { color: "#ff8800", marginBottom: 8 },
    p: { color: "#666", marginBottom: 20 },
    inputWrapper: {
      position: "relative",
      width: "100%",
      marginBottom: 16,
    },
    inputField: {
      width: "100%",
      height: 48,
      padding: "0 40px 0 12px",
      borderRadius: 8,
      border: "2px solid #ff8800",
      outline: "none",
      backgroundColor: "#fff",
      color: "#000",
      fontSize: 15,
      boxSizing: "border-box",
      transition: "0.3s",
    },
    togglePassword: {
      position: "absolute",
      right: 12,
      top: "50%",
      transform: "translateY(-50%)",
      background: "none",
      border: "none",
      cursor: "pointer",
      fontSize: 18,
    },
    loginBtn: {
      width: "100%",
      height: 48,
      backgroundColor: "#ff8800",
      color: "white",
      border: "none",
      borderRadius: 8,
      fontWeight: "bold",
      cursor: "pointer",
      fontSize: 16,
      marginTop: 8,
      transition: "0.3s",
    },
    loginBtnDisabled: { opacity: 0.6, cursor: "not-allowed" },
    registerLink: { marginTop: 16 },
    registerButton: {
      background: "none",
      border: "none",
      color: "#ff8800",
      fontWeight: "bold",
      cursor: "pointer",
      fontSize: 16,
    },
  };

  return (
    <>
      <div style={styles.container}>
        {/* Animation à gauche */}
        <div style={styles.leftPanel}>
          <Lottie
            animationData={animationData}
            loop={true}
            style={{ width: "80%", height: "80%" }}
          />
        </div>

        {/* Formulaire à droite */}
        <div style={styles.rightPanel}>
          <div style={styles.formBox}>
            <h1 style={styles.h1}>Connexion Transitaire</h1>
            <p style={styles.p}>Connectez-vous avec votre téléphone ou email</p>

            {/* Champ identifiant */}
            <div style={styles.inputWrapper}>
              <input
                type="text"
                placeholder="Téléphone ou email"
                value={identifiant}
                onChange={(e) => setIdentifiant(e.target.value)}
                style={styles.inputField}
              />
            </div>

            {/* Champ mot de passe */}
            <div style={styles.inputWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                placeholder="Mot de passe"
                style={styles.inputField}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.togglePassword}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>

            {/* Bouton connexion */}
            <button
              onClick={handleLogin}
              disabled={loading}
              style={
                loading
                  ? { ...styles.loginBtn, ...styles.loginBtnDisabled }
                  : styles.loginBtn
              }
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>

            <div style={styles.registerLink}>
              <button
                onClick={() => navigate("/register", { replace: true })}
                style={styles.registerButton}
              >
                Créer un compte
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Snackbar global */}
      <CustomSnackbar
        open={snackbar.open}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        severity={snackbar.severity}
      />
    </>
  );
}
