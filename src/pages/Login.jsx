import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Login.css";

import Logo from "../assets/images/logo.png";

import Input from "../components/Input";
import PasswordInput from "../components/PasswordInput";
import Button from "../components/Button";

export default function Login() {
    const [form, setForm] = useState({
        id: "",
        password: ""
    });

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleLogin = () => {
        console.log("Datos login:", form);
    };

    return (
        <div className="login-page">

            {/* Manchas de colores */}
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

                    <Input
                        label="Número de identificación"
                        placeholder="1234567890"
                        name="id"
                        value={form.id}
                        onChange={handleChange}
                    />

                    <PasswordInput
                        label="Contraseña"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                    />

                    <Button
                        text="Ingresar →"
                        onClick={handleLogin}
                    />

                    <p className="register-text">
                        ¿Tu escuela no es parte aún?{" "}
                        <Link to="/register" className="register-link">
                            Registrar institución
                        </Link>
                    </p>

                </div>
            </div>
        </div>
    );
}

