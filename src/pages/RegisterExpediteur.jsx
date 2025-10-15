import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerExpediteur } from "../services/authServiceExpediteur";

export default function RegisterExpediteur() {
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [numeroCnib, setNumeroCnib] = useState("");
  const [cnibRectoFile, setCnibRectoFile] = useState(null);
  const [cnibVersoFile, setCnibVersoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [erreur, setErreur] = useState("");

  const navigate = useNavigate();

  const handleFileChange = (e, isRecto) => {
    const file = e.target.files[0];
    if (!file) return;
    if (isRecto) setCnibRectoFile(file);
    else setCnibVersoFile(file);
  };

  const handleRegister = async () => {
    if (!nom || !prenom || !telephone || !motDePasse || !numeroCnib || !cnibRectoFile || !cnibVersoFile) {
      setErreur("Veuillez remplir tous les champs et sélectionner vos fichiers CNIB");
      return;
    }

    const formData = new FormData();
    formData.append("nom", nom);
    formData.append("prenom", prenom);
    formData.append("telephone", telephone);
    formData.append("motDePasse", motDePasse);
    formData.append("numeroCNIB", numeroCnib);
    formData.append("cnibRecto", cnibRectoFile);
    formData.append("cnibVerso", cnibVersoFile);

    setLoading(true);
    setErreur("");

    try {
      await registerExpediteur(formData);
      navigate("/");
    } catch (e) {
      setErreur(e.message);
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
    boxSizing: "border-box"
  };

  const fileCardStyle = {
    padding: 12,
    border: "2px solid #ff8800",
    borderRadius: 8,
    backgroundColor: "#fff",
    minHeight: 60,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
    color: "#333"
  };

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      backgroundColor: "#f5f5f5",
      fontFamily: "Arial, sans-serif",
      padding: 16
    }}>
      <div style={{
        width: "100%",
        maxWidth: 600,
        backgroundColor: "#fff",
        padding: 40,
        borderRadius: 16,
        boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
        display: "flex",
        flexDirection: "column",
        gap: 20
      }}>
        <h1 style={{ color: "#ff8800", textAlign: "center", fontSize: 28 }}>Inscription Transitaire</h1>

        {erreur && <div style={{ color: "#c00", backgroundColor: "#fdd", padding: 10, borderRadius: 8, textAlign: "center" }}>{erreur}</div>}

        <input type="text" placeholder="Nom" value={nom} onChange={(e) => setNom(e.target.value)} style={inputStyle} />
        <input type="text" placeholder="Prénom" value={prenom} onChange={(e) => setPrenom(e.target.value)} style={inputStyle} />
        <input type="tel" placeholder="Téléphone" value={telephone} onChange={(e) => setTelephone(e.target.value.replace("+", ""))} style={inputStyle} />

        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
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
            style={{ position: "absolute", right: 12, background: "none", border: "none", cursor: "pointer", fontSize: 18 }}
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>

        <input type="text" placeholder="Numéro CNIB" value={numeroCnib} onChange={(e) => setNumeroCnib(e.target.value)} style={inputStyle} />

       {/* Fichiers CNIB */}
<div style={{ display: "flex", gap: 16 }}>
  {/* CNIB Recto */}
  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
    <span style={{ fontWeight: "bold", color: "#ff8800", fontSize: 16 }}>CNIB Recto</span>
    <input
      type="file"
      accept="image/*"
      onChange={(e) => handleFileChange(e, true)}
      style={{ display: "none" }}
      id="cnibRectoInput"
    />
    <div
      onClick={() => document.getElementById("cnibRectoInput").click()}
      style={{
        padding: 12,
        border: "2px solid #ff8800",
        borderRadius: 8,
        backgroundColor: "#fff",
        minHeight: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 14,
        color: "#333",
        cursor: "pointer",
        transition: "0.2s",
      }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#fff7e6"}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#fff"}
    >
      {cnibRectoFile ? cnibRectoFile.name : "Cliquez ici pour télécharger le recto"}
    </div>
  </div>

  {/* CNIB Verso */}
  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
    <span style={{ fontWeight: "bold", color: "#ff8800", fontSize: 16 }}>CNIB Verso</span>
    <input
      type="file"
      accept="image/*"
      onChange={(e) => handleFileChange(e, false)}
      style={{ display: "none" }}
      id="cnibVersoInput"
    />
    <div
      onClick={() => document.getElementById("cnibVersoInput").click()}
      style={{
        padding: 12,
        border: "2px solid #ff8800",
        borderRadius: 8,
        backgroundColor: "#fff",
        minHeight: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 14,
        color: "#333",
        cursor: "pointer",
        transition: "0.2s",
      }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#fff7e6"}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#fff"}
    >
      {cnibVersoFile ? cnibVersoFile.name : "Cliquez ici pour télécharger le verso"}
    </div>
  </div>
</div>


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
            fontSize: 16
          }}
        >
          {loading ? "Inscription..." : "S'inscrire"}
        </button>

        <div style={{ textAlign: "center" }}>
          <button onClick={() => navigate("/")} style={{ background: "none", border: "none", color: "#ff8800", fontWeight: "bold", cursor: "pointer" }}>
            Déjà un compte ? Se connecter
          </button>
        </div>
      </div>
    </div>
  );
}
