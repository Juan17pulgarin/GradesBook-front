import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";

import Logo from "../assets/images/logo.png";

import Input from "../components/Input";
import PasswordInput from "../components/PasswordInput";
import Button from "../components/Button";

import { login } from "../services/authService";

export default function Login() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        documento: "",   // 🔥 ahora es documento
        password: ""
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await login({
                documento: form.documento, // 🔥 CLAVE
                password: form.password
            });

            console.log("Respuesta backend:", res.data);

            localStorage.setItem("token", res.data.token);

            navigate("/dashboard");

        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Error al iniciar sesión"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="blur-bg"></div>
            <div className="blur-bg2"></div>
            <div className="blur-bg3"></div>
            <div className="blur-bg4"></div>

            <div className="login-container">
                <div className="login-card">

                    <div className="logo-container">
                        <img src={Logo} alt="logo" className="logo-img" />
                    </div>

                    <h2>GradesBook</h2>
                    <p className="subtitle">EL FUTURO ES DE TODOS</p>

                    <form onSubmit={handleLogin}>

                        <Input
                            label="Número de documento"
                            placeholder="123456789"
                            name="documento"
                            value={form.documento}
                            onChange={handleChange}
                        />

                        <PasswordInput
                            label="Contraseña"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                        />

                        {error && <p style={{ color: "red" }}>{error}</p>}

                        <Button
                            text={loading ? "Ingresando..." : "Ingresar →"}
                            type="submit"
                        />

                    </form>
                </div>
            </div>
        </div>
    );
}