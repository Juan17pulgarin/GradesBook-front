import { useState } from "react";
import { updateUser } from "../../services/userService";

import { MdOutlineMailOutline } from "react-icons/md";
import { FaIdCard } from "react-icons/fa";
import { MdOutlineCall } from "react-icons/md";

import "./UserModal.css";

export default function EditUserModal({ user, onClose, onSuccess }) {
    const [form, setForm] = useState({
        nombres: user.nombres || "",
        apellidos: user.apellidos || "",
        email: user.email || "",
        documento: user.documento || "",
        telefono: user.telefono || "",
        institucion_id: user.institucion_id || ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        setError("");

        if (!form.nombres || !form.apellidos || !form.email || !form.documento) {
            setError("Por favor completa todos los campos obligatorios.");
            return;
        }

        setLoading(true);

        console.log("FORM:", form);
        console.log("USER:", user);
        console.log("LOCALSTORAGE:", localStorage.getItem("institucion_id"));

        try {
            // 🔥 OBTENER institucion_id SEGURO
            const institucion_id_raw =
                form.institucion_id ??
                user.institucion_id ??
                localStorage.getItem("institucion_id");

            const institucion_id = Number(institucion_id_raw);

            if (!institucion_id || Number.isNaN(institucion_id)) {
                throw new Error("INSTITUCION_ID_INVALID");
            }

            // 🔥 SOLO ENVIAR CAMPOS QUE CAMBIARON
            const dataToSend = {};

            Object.keys(form).forEach((key) => {
                if (
                    form[key] !== "" &&
                    form[key] !== null &&
                    form[key] !== undefined &&
                    form[key] !== user[key]
                ) {
                    dataToSend[key] = form[key];
                }
            });

            // 🔥 AGREGAR institucion_id SIEMPRE
            dataToSend.institucion_id = institucion_id;

            console.log("DATA QUE SE ENVÍA:", dataToSend);

            await updateUser(user.id, dataToSend);

            onSuccess();

        } catch (err) {
            if (err.message === "INSTITUCION_ID_INVALID") {
                setError("Error interno: institución no definida.");
            } else {
                setError(err.response?.data?.message || "Error al actualizar el usuario.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal" onClick={onClose}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>

                <div className="modal-header">
                    <div>
                        <h2>Editar {user.tipo === "ESTUDIANTE" ? "Estudiante" : "Docente"}</h2>
                        <p>GESTIÓN DE PERSONAL ACADÉMICO</p>
                    </div>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="modal-body">
                    <div className="form-grid">

                        <div className="form-group">
                            <label>Nombres *</label>
                            <input
                                name="nombres"
                                value={form.nombres}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>Email Institucional *</label>
                            <div className="input-icon">
                                <span><MdOutlineMailOutline /></span>
                                <input
                                    name="email"
                                    type="email"
                                    value={form.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Apellidos *</label>
                            <input
                                name="apellidos"
                                value={form.apellidos}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>Documento *</label>
                            <div className="input-icon">
                                <span><FaIdCard /></span>
                                <input
                                    name="documento"
                                    value={form.documento}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Teléfono</label>
                            <div className="input-icon">
                                <span><MdOutlineCall /></span>
                                <input
                                    name="telefono"
                                    value={form.telefono}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                    </div>

                    {error && <p className="modal-error">{error}</p>}
                </div>

                <div className="modal-footer">
                    <button className="cancel-btn" onClick={onClose}>
                        Cancelar
                    </button>
                    <button
                        className="submit-btn"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? "Guardando..." : "Guardar Cambios →"}
                    </button>
                </div>

            </div>
        </div>
    );
}