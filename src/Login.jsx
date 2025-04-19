import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
//import { useHistory } from "react-router";
import clientId from "./client-id/client-id";

const redirectUri = "http://localhost/deploy/youtube-tools/app/?oauth-callback";
const scope = "https://www.googleapis.com/auth/youtube";

const Login = ({ onLoginSuccess }) => {
  //const history = useHistory();
  const [loginError, setLoginError] = useState(null);

  const handleLogin = () => {
    sessionStorage.setItem("access_token", "your_access_token");
    //history.push("/");
  };

  const handleLoginClicked = () => {
    let authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&response_type=token`;
    window.location.href = authUrl;
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col">
          <div className="px-4 py-5 my-5 text-center">
            <h1 className="display-5 mb-3 fw-bold text-body-emphasis pb-4">
              YouTube&trade; Tools
            </h1>
            <div className="col-lg-6 mx-auto">
              <div className="d-grid gap-2 d-sm-flex justify-content-sm-center">
                <button
                  type="button"
                  className="btn btn-info btn-lg px-4 gap-3"
                  onClick={handleLoginClicked}
                >
                  Login with YouTube&trade;
                </button>
              </div>
            </div>
            {loginError && (
              <div className="alert alert-danger">Login failed: {loginError}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

Login.propTypes = {
};

export default Login;
