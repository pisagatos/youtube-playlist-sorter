import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import clientId from "./client-id";

const redirectUri = "http://localhost/deploy/youtube-playlist-sorter/extension/?oauth-callback";
const scope = "https://www.googleapis.com/auth/youtube";

const LoginPanel = ({ onLoginSuccess }) => {
  const [loginError, setLoginError] = useState(null);

  const handleLoginFailed = (error) => {
    setLoginError(error);
  };

  // Maneja la redirección después del login
  const handleOauthCallback = (url) => {
    if (url.startsWith(redirectUri)) {
      const accessTokenParam = "access_token=";
      const index = url.indexOf(accessTokenParam);
      if (index === -1) return false;

      const params = url.substring(index + accessTokenParam.length).split("&");
      const token = params[0];

      validateToken(token, (error) => {

        if (error === null) {
          sessionStorage.setItem("access_token", token);
          onLoginSuccess(token);

          return true;
        } else {
          handleLoginFailed(error);

          return false;
        }
      });
    }
  };

  useEffect(() => {
    const handleBeforeNavigate = () => {
      // Verifica si es la primera vez que el usuario entra
      const isFirstVisit = !localStorage.getItem("visitedBefore");

      if (isFirstVisit) {
        // Marca que el usuario ya visitó la web para futuras sesiones
        localStorage.setItem("visitedBefore", "true");
      } else {
        // Solo mostrar el mensaje si el usuario ya ha visitado antes
        const token = sessionStorage.getItem("access_token");
        if (!token) {
          handleLoginFailed("No se ha podido recuperar el token de sesión.");
        }
      }

      if (handleOauthCallback(window.location.href)) {
        // window.close();
      }
    };

    // Agrega eventos para detectar cambios de navegación
    window.addEventListener("beforeunload", handleBeforeNavigate);
    window.addEventListener("load", handleBeforeNavigate);

    return () => {
      // Limpia los eventos al desmontar el componente
      window.removeEventListener("beforeunload", handleBeforeNavigate);
      window.removeEventListener("load", handleBeforeNavigate);
    };
  }, [handleOauthCallback]);

  // Maneja el clic en el botón de login
  const handleLoginClicked = () => {
    let authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&response_type=token`;

    /*
    let width = 600;
    let height = 600;
    let left = window.innerWidth / 2 - width / 2;
    let top = window.innerHeight / 2 - height / 2;

    let options = `width=${width},height=${height},left=${Math.round(left)},top=${Math.round(top)}`;
    let authWindow = window.open(authUrl, "_blank", options);
    
    if (!authWindow) {
      alert("Por favor, habilita las ventanas emergentes para continuar con la autenticación.");
    }
    */

    window.location.href = authUrl;
  };

  // Valida el token obtenido
  const validateToken = (token, callback) => {
    let url = `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${token}`;
    let response = false;

    fetch(url, {
      mode: 'cors'
    })
      .then((response) => {
        if (response.status !== 200) {
          callback(false);
        }
        response.json().then((data) => {
          callback(data.audience === clientId ? null : "Mismatched client ID");
          response = true;
        });
      })
      .catch((error) => callback(error));

    return response;
  };

  return (
    <div className="px-4 py-5 my-5 text-center">
      <h1 className="display-5 mb-3 fw-bold text-body-emphasis pb-4">
        Playlist Sorter for YouTube&trade;
      </h1>
      <div className="col-lg-6 mx-auto">
        <div className="d-grid gap-2 d-sm-flex justify-content-sm-center">
          <button type="button" className="btn btn-primary btn-lg px-4 gap-3" onClick={handleLoginClicked}>
            Login with YouTube&trade;
          </button>
        </div>
      </div>
      {loginError && <div className="alert alert-danger">Login failed: {loginError}</div>}
    </div>
  );
};

LoginPanel.propTypes = {
  onLoginSuccess: PropTypes.func.isRequired,
};

export default LoginPanel;