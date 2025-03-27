import React, { useState, useEffect, useCallback } from "react";
import LoginPanel from "./login-panel";
import Header from "./header";
import PlaylistPanel from "./playlist-panel";
import PlaylistManager from "./playlist-manager";
import PlaylistManagerSort from "./playlist-manager-sort";
import PlaylistManagerFetch from "./playlist-manager-fetch";

const loginPanelId = "login";
const playlistPanelId = "playlist";

const PlaylistSorter = () => {
  // Estado del componente
  const [accessToken, setAccessToken] = useState(null);
  const [currentPanelId, setCurrentPanelId] = useState(loginPanelId);
  const [currentPlaylist, setCurrentPlaylist] = useState(null);
  const [currentPlaylistItemCount, setCurrentPlaylistItemCount] = useState(0);
  const [loginError, setLoginError] = useState(null);
  const [progressMessage, setProgressMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Manejador de login exitoso
  const handleLoginSuccess = (token) => {
    setAccessToken(token);
    setCurrentPanelId(playlistPanelId);
  };  

  // Manejo de selección de playlist
  const handlePlaylistSelected = useCallback((playlist, itemCount) => {
    setCurrentPlaylist(playlist);
    setCurrentPlaylistItemCount(itemCount);
  }, []);

  // Volver a la pantalla de playlists
  const handleBackToPlaylists = useCallback(() => {
    setCurrentPanelId(playlistPanelId);
  }, []);

  // Mostrar mensaje de progreso
  const handleProgressStart = useCallback((message) => {
    setProgressMessage(message);
    setErrorMessage(null);
  }, []);

  // Ocultar mensaje de progreso
  const handleProgressStop = useCallback(() => {
    setProgressMessage(null);
  }, []);

  // Manejo de errores
  const handleError = useCallback((message) => {
    setErrorMessage(message);
  }, []);

  // Cerrar sesión y revocar el token
  const handleLogout = useCallback(() => {
    if (accessToken) {
      revokeToken(accessToken).catch((error) => {
        console.log("Could not revoke token:", error.message); // eslint-disable-line no-console
      });
    }
    setAccessToken(null);
    setCurrentPanelId(loginPanelId);
  }, [accessToken]);

  useEffect(() => {
    const token = sessionStorage.getItem("access_token");
    if (token) {
      setAccessToken(token);
      setCurrentPanelId(playlistPanelId);
    }
  }, []);

  // Obtener el header según el estado actual
  const getHeader = () => {
    let statusMessage = errorMessage || progressMessage;
    if (currentPanelId !== loginPanelId) {
      return <Header statusMessage={statusMessage} onLogout={handleLogout} />;
    }
    return null;
  };

  // Determinar qué panel mostrar
  const getCurrentPanel = () => {
    if (currentPanelId === playlistPanelId) {
      return (
        <PlaylistPanel
          accessToken={accessToken}
          onPlaylistSelected={handlePlaylistSelected}
          onError={handleError}
          onProgressStart={handleProgressStart}
          onProgressStop={handleProgressStop}
        />
      );
    }
    return <LoginPanel onLoginSuccess={handleLoginSuccess} />;
  };

  // Revocar token de acceso
  const revokeToken = (token) => {
    const url = `https://accounts.google.com/o/oauth2/revoke?token=${token}`;
    return fetch(url);
  };

  return (
    <div className="container">
      {getHeader()}
      {getCurrentPanel()}
    </div>
  );
};

export default PlaylistSorter;