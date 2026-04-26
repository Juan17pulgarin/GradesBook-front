import React, { useState } from "react";
import "../styles/Register.css";

import { BsStars } from "react-icons/bs";
import { FaRegQuestionCircle } from "react-icons/fa";

import Input from "../components/Input";
import Button from "../components/Button";

export default function Register() {
  const [form, setForm] = useState({
    nombre: "",
    correo: "",
    telefono: "",
    direccion: ""
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = () => {
    console.log("Datos registro:", form);
  };

  return (
    <div className="register-page">

      <div className="header">
        <h2 className="logo">GradesBook</h2>
        <div className="help">
          <FaRegQuestionCircle />
        </div>
      </div>

      <div className="container">
        <div className="wrapper">

          {/* Izquierda */}
          <div className="left">
            <div className="left-content">

              <h1>Registra tu Institución</h1>

              <p>
                Únete a la red de colegios que están <br />
                transformando la educación con tecnología <br />
                humana.
              </p>

              <div className="form">

                <Input
                  label="Nombre de la Institución"
                  placeholder="Ej. Skyline Academy"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                />

                <div className="row">

                  <Input
                    label="Correo Institucional"
                    placeholder="admin@escuela.edu"
                    name="correo"
                    value={form.correo}
                    onChange={handleChange}
                  />

                  <Input
                    label="Teléfono"
                    placeholder="+57 300 0000000"
                    name="telefono"
                    value={form.telefono}
                    onChange={handleChange}
                  />

                </div>

                <Input
                  label="Dirección"
                  placeholder="Calle, Número, Ciudad"
                  name="direccion"
                  value={form.direccion}
                  onChange={handleChange}
                />

                <Button
                  text="Completar Registro →"
                  onClick={handleRegister}
                />

              </div>

            </div>
          </div>

          {/* Derecha */}
          <div className="right">
            <div className="overlay-box">
              <div className="overlay-content">

                <div className="icon">
                  <BsStars className="stars" />
                </div>

                <h2>
                  Bienvenido a la <br />
                  comunidad
                </h2>

                <p>
                  Más instituciones ya están <br />
                  optimizando su gestión diaria con <br />
                  nosotros.
                </p>

              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}