import React, { useState, useEffect, useCallback } from "react";
import Header from "./Header";
import PlayListSorter from "./playlists/PlayListSorter";
//import DatabasePanel from "./DatabasePanel";

const playlistPanelId = "playlist";

const Layout = ({ render }) => {

  // Estado del componente
  const [currentPlaylist, setCurrentPlaylist] = useState(null);

  // Cerrar sesión y revocar el token
  const handleLogout = useCallback(() => {
    if (accessToken) {
      revokeToken(accessToken).catch((error) => {
        console.log("Could not revoke token:", error.message); // eslint-disable-line no-console
      });
    }
    setAccessToken(null);
    
    // redirect to login page
    navigate('login')
  }, []);

  // Revocar token de acceso
  const revokeToken = (token) => {
    const url = `https://accounts.google.com/o/oauth2/revoke?token=${token}`;
    return fetch(url);
  };

  const getCurrentPanel = () => {
    switch (render) {
      case "playlists":
        return <PlayListSorter setCurrentPlaylist={setCurrentPlaylist} />;
      case "database":
        // return <Database />;
      default:
       // return <PlayListSorter setCurrentPlaylist={setCurrentPlaylist} />;
    }
  }

  return (
    <div className="container-fluid">
      <div className="row">
        {<Header onLogout={handleLogout} />}
        {getCurrentPanel()}
      </div>
    </div>
  );
};

export default Layout;