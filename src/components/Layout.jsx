import React, { useState } from "react";
import Sidebar from "./Sidebar";
import { Box } from "@mui/material";

const Layout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const toggleSidebar = () => setCollapsed(!collapsed);

  const sidebarWidth = collapsed ? 70 : 250;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#FFF8F0" }}>
      {/* Barre latérale */}
      <Box
        sx={{
          width: sidebarWidth,
          background: "linear-gradient(180deg, #FF6D00 0%, #FF9800 50%, #FFA726 100%)",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          height: "100%",
          boxShadow: "2px 0 10px rgba(0,0,0,0.15)",
          transition: "width 0.3s ease",
          overflow: "hidden",
          borderRight: "1px solid rgba(255,255,255,0.2)",
        }}
      >
        <Sidebar collapsed={collapsed} toggleSidebar={toggleSidebar} />
      </Box>

      {/* Contenu principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: `${sidebarWidth}px`,
          p: 4,
          bgcolor: "#FFF8F0",
          color: "#333",
          transition: "margin-left 0.3s ease",
          minHeight: "100vh",
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
