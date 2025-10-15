import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import animationData from "../assets/truck.json";
import { loginExpediteur } from "../services/authServiceExpediteur";

export default function LoginExpediteur() {
  const [telephone, setTelephone] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!telephone || !motDePasse) {
      setErreur("Veuillez remplir tous les champs");
      return;
    }

    setLoading(true);
    setErreur("");
    try {
      const data = await loginExpediteur(telephone, motDePasse);
      localStorage.setItem("token", data.token);
      navigate("/home", { replace: true });
    } catch (e) {
      setErreur(e.message || "Erreur inconnue. Vérifiez vos identifiants ou connexion.");
    } finally {
      setLoading(false);
    }
  };

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
    },
    h1: { color: "#ff8800", marginBottom: 8 },
    p: { color: "#666", marginBottom: 20 },
    errorMsg: {
      color: "#c00",
      backgroundColor: "#fdd",
      padding: 8,
      borderRadius: 6,
      marginBottom: 16,
    },
    inputWrapper: {
      position: "relative",
      width: "100%",
      marginBottom: 16,
    },
    inputField: {
      width: "100%",
      height: 48,
      padding: "0 40px 0 12px", // espace pour l'icône à droite
      borderRadius: 8,
      border: "2px solid #ff8800",
      outline: "none",
      backgroundColor: "#fff",
      color: "#000",
      fontSize: 15,
      boxSizing: "border-box",
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
    <div style={styles.container}>
      {/* Partie gauche animation */}
      <div style={styles.leftPanel}>
        <Lottie
          animationData={animationData}
          loop={true}
          style={{ width: "80%", height: "80%" }}
        />
      </div>

      {/* Partie droite formulaire */}
      <div style={styles.rightPanel}>
        <div style={styles.formBox}>
          <h1 style={styles.h1}>Connexion Transitaire</h1>
          <p style={styles.p}>Veuillez entrer vos informations de connexion</p>

          {erreur && <div style={styles.errorMsg}>{erreur}</div>}

          {/* Champ téléphone */}
          <div style={styles.inputWrapper}>
            <input
              type="text"
              placeholder="Numéro de téléphone"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
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
  );
}
