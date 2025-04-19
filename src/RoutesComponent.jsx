import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useSearchParams, useNavigate, useLocation } from 'react-router';
import Login from './Login';
import Layout from "./Layout";
import Prueba from './.eliminar/Prueba';

const RoutesComponent = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const hash = window.location.hash;
        const params = new URLSearchParams(hash.replace(/^#/, ''));
        const token = params.get('access_token');

        if (token) {
            // Si hay token, lo guardamos en el localStorage
            localStorage.setItem('access_token', token);
            localStorage.setItem('expires_in', params.get('expires_in')); // (segundos) 3600 segundos = 1 hora
            localStorage.setItem('token_type', params.get('token_type'));
            localStorage.setItem('scope', params.get('scope'));
            localStorage.setItem('datetime', Math.floor(new Date().getTime() / 1000)); // Guardamos la fecha del guardado en segundos

            // Redirige a la app principal
            navigate('');
        } else {
            // Si no hay token, intenta obtenerlo del localStorage
            const storedToken = localStorage.getItem('access_token');
            const storedExpiresIn = localStorage.getItem('expires_in');
            const storedDatetime = localStorage.getItem('datetime');
            const currentDatetime = Math.floor(new Date().getTime() / 1000); // Fecha actual en segundos

            // Comprobamos si el token existe y no ha expirado
            const tokenExpired = (currentDatetime - storedDatetime) > storedExpiresIn; // Comprobamos si ha pasado el tiempo de expiración

            // Si el token ha expirado, redirige a la página de login
            if (!storedToken || tokenExpired) {
                navigate('login');
            } else {
                // Si el token existe y no ha expirado, redirige a la app principal
                navigate('');
            }
        }
    }, [navigate]);

    return (
        <>
            <Routes>
                <Route path="/" element={<Layout render="playlists" />} />
                <Route path="playlists" element={<Layout render="playlists" />} />
                <Route path="database" element={<Layout render="database" />} />

                <Route path="login" element={<Login />} />
            </Routes>

        </>
    );
};

export default RoutesComponent;