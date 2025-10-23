import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerExpediteur } from "../services/authServiceExpediteur";
import CustomSnackbar from "../components/CustomSnackbar";

export default function RegisterExpediteur() {
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [numeroCnib, setNumeroCnib] = useState("");
  const [cnibRectoFile, setCnibRectoFile] = useState(null);
  const [cnibVersoFile, setCnibVersoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const navigate = useNavigate();

  const handleFileChange = (e, isRecto) => {
    const file = e.target.files[0];
    if (!file) return;
    if (isRecto) setCnibRectoFile(file);
    else setCnibVersoFile(file);
  };

  const handleRegister = async () => {
    if (
      !nom ||
      !prenom ||
      !telephone ||
      !email ||
      !motDePasse ||
      !numeroCnib ||
      !cnibRectoFile ||
      !cnibVersoFile
    ) {
      setSnackbar({
        open: true,
        message:
          "Veuillez remplir tous les champs et sélectionner vos fichiers CNIB recto/verso",
        severity: "warning",
      });
      return;
    }

    const formData = new FormData();
    formData.append("nom", nom);
    formData.append("prenom", prenom);
    formData.append("telephone", telephone);
    formData.append("email", email);
    formData.append("motDePasse", motDePasse);
    formData.append("numeroCNIB", numeroCnib);
    formData.append("cnibRecto", cnibRectoFile);
    formData.append("cnibVerso", cnibVersoFile);

    setLoading(true);
    try {
      await registerExpediteur(formData);
      setSnackbar({
        open: true,
        message: "Inscription réussie ✅",
        severity: "success",
      });
      setTimeout(() => navigate("/"), 1000);
    } catch (e) {
      setSnackbar({
        open: true,
        message: e.message || "Erreur lors de l'inscription",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: 14,
    borderRadius: 8,
    border: "2px solid #ff8800",
    backgroundColor: "#fff",
    outline: "none",
    color: "#000",
    fontSize: 16,
    boxSizing: "border-box",
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        fontFamily: "Arial, sans-serif",
        padding: 16,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 600,
          backgroundColor: "#fff",
          padding: 40,
          borderRadius: 16,
          boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <h1 style={{ color: "#ff8800", textAlign: "center", fontSize: 28 }}>
          Inscription Expéditeur
        </h1>

        {/* Champs texte */}
        <input
          type="text"
          placeholder="Nom"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          style={inputStyle}
        />
        <input
          type="text"
          placeholder="Prénom"
          value={prenom}
          onChange={(e) => setPrenom(e.target.value)}
          style={inputStyle}
        />
        <input
          type="tel"
          placeholder="Téléphone"
          value={telephone}
          onChange={(e) => setTelephone(e.target.value.replace("+", ""))}
          style={inputStyle}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />

        {/* Mot de passe */}
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
          }}
        >
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Mot de passe"
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            style={inputStyle}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: 12,
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 18,
            }}
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>

        <input
          type="text"
          placeholder="Numéro CNIB"
          value={numeroCnib}
          onChange={(e) => setNumeroCnib(e.target.value)}
          style={inputStyle}
        />

        {/* 🔹 Téléversement CNIB centré côte à côte */}
        <div>
          <p style={{ fontWeight: "bold", marginBottom: 8, color: "#ff8800", textAlign: "center" }}>
            Téléversement CNIB :
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 30,
              flexWrap: "wrap",
            }}
          >
            {/* CNIB Recto */}
            <div
              style={{
                backgroundColor: "#ff8800",
                color: "#fff",
                borderRadius: 12,
                padding: 20,
                width: 230,
                textAlign: "center",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.03)";
                e.currentTarget.style.boxShadow = "0 6px 15px rgba(0,0,0,0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
              }}
            >
              <label htmlFor="recto-upload" style={{ fontWeight: "bold", marginBottom: 10 }}>
                📄 CNIB Recto
              </label>
              <input
                id="recto-upload"
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => handleFileChange(e, true)}
                style={{ display: "none" }}
              />
              <button
                onClick={() => document.getElementById("recto-upload").click()}
                style={{
                  backgroundColor: "#fff",
                  color: "#ff8800",
                  border: "none",
                  padding: "10px 16px",
                  borderRadius: 6,
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Choisir un fichier
              </button>
              {cnibRectoFile && (
                <p style={{ marginTop: 10, color: "#dfffdf", fontWeight: "bold" }}>
                  ✅ {cnibRectoFile.name}
                </p>
              )}
            </div>

            {/* CNIB Verso */}
            <div
              style={{
                backgroundColor: "#ff8800",
                color: "#fff",
                borderRadius: 12,
                padding: 20,
                width: 230,
                textAlign: "center",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.03)";
                e.currentTarget.style.boxShadow = "0 6px 15px rgba(0,0,0,0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
              }}
            >
              <label htmlFor="verso-upload" style={{ fontWeight: "bold", marginBottom: 10 }}>
                📄 CNIB Verso
              </label>
              <input
                id="verso-upload"
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => handleFileChange(e, false)}
                style={{ display: "none" }}
              />
              <button
                onClick={() => document.getElementById("verso-upload").click()}
                style={{
                  backgroundColor: "#fff",
                  color: "#ff8800",
                  border: "none",
                  padding: "10px 16px",
                  borderRadius: 6,
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Choisir un fichier
              </button>
              {cnibVersoFile && (
                <p style={{ marginTop: 10, color: "#dfffdf", fontWeight: "bold" }}>
                  ✅ {cnibVersoFile.name}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Bouton inscription */}
        <button
          onClick={handleRegister}
          disabled={loading}
          style={{
            width: "100%",
            padding: 14,
            backgroundColor: "#ff8800",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontWeight: "bold",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.6 : 1,
            fontSize: 16,
          }}
        >
          {loading ? "Inscription..." : "S'inscrire"}
        </button>

        <div style={{ textAlign: "center" }}>
          <button
            onClick={() => navigate("/")}
            style={{
              background: "none",
              border: "none",
              color: "#ff8800",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Déjà un compte ? Se connecter
          </button>
        </div>
      </div>

      {/* Snackbar */}
      <CustomSnackbar
        open={snackbar.open}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        severity={snackbar.severity}
      />
    </div>
  );
}
