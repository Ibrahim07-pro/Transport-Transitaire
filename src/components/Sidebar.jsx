import React, { useMemo } from "react";
import {
  Box,
  Button,
  List,
  ListItem,
  ListItemButton,
  IconButton,
  Tooltip,
  Typography,
  Divider,
} from "@mui/material";
import {
  Home as HomeIcon,
  History as HistoryIcon,
  LocalShipping as PropositionsIcon,
  ExitToApp as LogoutIcon,
  Menu as MenuIcon,
} from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import dashboardImg from "../assets/delivery-man.png";

const Sidebar = ({ collapsed, toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = useMemo(
    () => [
      { text: "Accueil", icon: <HomeIcon fontSize="medium" />, path: "/home" },
      { text: "Mes Expéditions", icon: <HistoryIcon fontSize="medium" />, path: "/mes-expeditions" },
      { text: "Propositions", icon: <PropositionsIcon fontSize="medium" />, path: "/demandes-en-attente" },
    ],
    []
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <Box
      sx={{
        width: collapsed ? 90 : 250,
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: "linear-gradient(180deg, #FF6D00 0%, #FF9800 50%, #FFA726 100%)",
        boxShadow: "4px 0 24px rgba(255, 109, 0, 0.25)",
        borderRadius: "0 12px 12px 0",
        overflow: "hidden",
        transition: "all 0.3s ease",
        color: "#fff",
        position: "relative",
      }}
    >
      {/* Bouton menu */}
      <Box sx={{ display: "flex", justifyContent: collapsed ? "center" : "flex-start", p: 1.5 }}>
        <Tooltip title={collapsed ? "Ouvrir" : "Réduire"}>
          <IconButton onClick={toggleSidebar} sx={{ color: "#fff" }}>
            <MenuIcon fontSize="medium" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Logo et titre */}
      <Box
        sx={{
          textAlign: "center",
          mb: collapsed ? 1 : 3,
          px: collapsed ? 0 : 2,
          transition: "all 0.3s ease",
        }}
      >
        <Box
          sx={{
            width: collapsed ? 0 : 110,
            height: "auto",
            mx: "auto",
            mb: 1.5,
            opacity: collapsed ? 0 : 1,
            transition: "all 0.3s ease",
          }}
        >
          <img src={dashboardImg} alt="Logo" style={{ width: "100%", borderRadius: "10px" }} />
        </Box>

        {!collapsed && (
          <>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                color: "#fff",
                letterSpacing: 0.5,
                fontSize: "1rem",
              }}
            >
              TRANSITAIRE
            </Typography>
          </>
        )}
      </Box>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.2)", mb: collapsed ? 0 : 1 }} />

      {/* Menu principal */}
      <List sx={{ flexGrow: 1, px: collapsed ? 0.5 : 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <Tooltip title={collapsed ? item.text : ""} placement="right">
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  sx={{
                    justifyContent: collapsed ? "center" : "flex-start",
                    bgcolor: isActive ? "#fff" : "transparent",
                    color: isActive ? "#FF6D00" : "#fff",
                    borderRadius: 2,
                    py: 1,
                    px: collapsed ? 0 : 1.8,
                    fontWeight: isActive ? 600 : 400,
                    fontSize: collapsed ? "0.8rem" : "0.9rem",
                    transition: "all 0.25s ease",
                    "&:hover": {
                      bgcolor: isActive ? "#fff" : "rgba(255,255,255,0.15)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      mr: collapsed ? 0 : 1.5,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {item.icon}
                  </Box>
                  {!collapsed && item.text}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.2)" }} />

      {/* Bouton déconnexion */}
      <Box sx={{ display: "flex", justifyContent: "center", p: 1.5 }}>
        <Button
          variant="contained"
          startIcon={<LogoutIcon fontSize="small" />}
          onClick={handleLogout}
          sx={{
            width: collapsed ? 46 : "100%",
            bgcolor: "#fff",
            color: "#FF6D00",
            "&:hover": { bgcolor: "#F3F4F6" },
            textTransform: "none",
            borderRadius: 2,
            fontWeight: 600,
            px: collapsed ? 0 : 2,
            py: 0.8,
            fontSize: "0.85rem",
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
          }}
        >
          {!collapsed && "Déconnexion"}
        </Button>
      </Box>
    </Box>
  );
};

export default Sidebar;
