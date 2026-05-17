import { useState } from "react";
import api from "../api/api";
import "../styles/UserModal.css";

export default function EditUserModal({ user, onClose, onSuccess }) {
    const [form, setForm] = useState({
        nombres: user.nombres || "",
        apellidos: user.apellidos || "",
        email: user.email || "",
        documento: user.documento || "",
        telefono: user.telefono || "",
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
        try {
            await api.patch(`/users/${user.id}`, form);
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.message || "Error al actualizar el usuario.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal" onClick={onClose}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>

                {/* Header */}
                <div className="modal-header">
                    <div>
                        <h2>Editar Docente</h2>
                        <p>GESTIÓN DE PERSONAL ACADÉMICO</p>
                    </div>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                {/* Form */}
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
                                <span>✉</span>
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
                                <span>🪪</span>
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
                                <span>📞</span>
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

                {/* Footer */}
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