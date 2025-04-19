import React from 'react';
import { Navigate } from 'react-router';

const PrivateRoute = ({ element }) => {
    const accessToken = localStorage.getItem('access_token');

    return accessToken ? element : <Navigate to="/login" replace />;
};

export default PrivateRoute;