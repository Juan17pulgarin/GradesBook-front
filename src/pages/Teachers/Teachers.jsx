import { useEffect, useState } from "react";
import { getUsers, deactivateUser } from "../../services/userService";
import { getAcademicLoads } from "../../services/academicLoadService";
import { getSubjects } from "../../services/subjectService";

import StatCard from "../../components/Cards/StatCard";
import Table from "../../components/Table/Table";
import UserRow from "../../components/Table/UserRow";
import UserModal from "../../components/Modal/UserModal";
import EditUserModal from "../../components/Modal/EditUserModal";

import { FaUsers, FaRegCircleCheck } from "react-icons/fa6";
import { MdMenuBook } from "react-icons/md";
import { RiUserAddLine } from "react-icons/ri";
import { MdOutlinePersonOff, MdOutlineGroup } from "react-icons/md";

import "./Teachers.css";

const COLUMNS = ["Foto/Nombre", "Materia Asignada", "Correo", "Acciones"];

export default function TeachersPage() {
    const [teachers, setTeachers] = useState([]);
    const [inactivos, setInactivos] = useState([]);
    const [totalMaterias, setTotalMaterias] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [editTeacher, setEditTeacher] = useState(null);
    const [showInactivos, setShowInactivos] = useState(false);

    const fetchData = () => {
        setLoading(true);
        Promise.all([
            getUsers("DOCENTE"),
            getAcademicLoads(),
            getSubjects(),
        ])
            .then(([teachersRes, loadsRes, subjectsRes]) => {
                const loads = loadsRes.data;
                const subjects = subjectsRes.data;

                const enriched = teachersRes.data.map((t) => {
                    const load = loads.find((l) => l.docente_id === t.id);
                    const subject = load ? subjects.find((s) => s.id === load.materia_id) : null;
                    return {
                        ...t,
                        activo: true,
                        materia: subject?.nombre || "Sin asignar",
                        load_id: load?.id || null,
                    };
                });

                const backIds = new Set(teachersRes.data.map((t) => t.id));
                setInactivos((prev) => prev.filter((t) => !backIds.has(t.id)));
                setTeachers(enriched);
                setTotalMaterias(subjects.length);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error:", err);
                setError(true);
                setLoading(false);
            });
    };

    useEffect(() => { fetchData(); }, []);

    const handleDesactivar = async (teacher) => {
        await deactivateUser(teacher.id, false);
        setTeachers((prev) => prev.filter((t) => t.id !== teacher.id));
        setInactivos((prev) => [...prev, { ...teacher, activo: false }]);
    };

    const handleReactivar = async (teacher) => {
        await deactivateUser(teacher.id, true);
        setInactivos((prev) => prev.filter((t) => t.id !== teacher.id));
        fetchData();
    };

    const total   = teachers.length + inactivos.length;
    const activos = teachers.length;

    return (
        <div className="Teachers-page">
            <div className="header-row">
                <div>
                    <h1>Gestión de <span>Docentes</span></h1>
                    <p>
                        Bienvenido al panel central de profesores. Aquí puedes administrar el equipo <br />
                        académico de <span>Escuela Viva</span>.
                    </p>
                </div>
                <button className="login-btn" onClick={() => setOpenModal(true)}>
                    <RiUserAddLine /> Añadir Nuevo Docente
                </button>
            </div>

            <div className="cards">
                <StatCard 
                title="Total Docentes" 
                value={total} 
                color="default" 
                icon={FaUsers}
                valueColor="#2A3031" 
                titleColor="#575C5E" 
                iconColor="#FFFFFF"
                iconStyle={{ fontSize: "1.6rem", 
                    background: "#0284c7", 
                    padding: "12px", 
                    borderRadius: "50%", 
                    width: "52px", 
                    height: "52px" }}
                />
                <StatCard 
                title="Docentes Activos" 
                value={activos} 
                color="green" 
                icon={FaRegCircleCheck}
                valueColor="#2A3031" 
                titleColor="#575C5E" 
                iconColor="#FFFFFF"
                iconStyle={{ fontSize: "1.6rem", 
                    background: "#3C6600", 
                    padding: "12px", 
                    borderRadius: "50%", 
                    width: "52px", 
                    height: "52px" }}
                />
                <StatCard 
                title="Materias Cubiertas" 
                value={totalMaterias} 
                color="yellow" 
                icon={MdMenuBook}
                valueColor="#2A3031" 
                titleColor="#5C4900" 
                iconColor="#463600"
                iconStyle={{ fontSize: "1.6rem", 
                    background: "#EEC540", 
                    padding: "12px", 
                    borderRadius: "50%", 
                    width: "52px", 
                    height: "52px" }}
                />
            </div>

            <div className="filter-toggle">
                <button
                    className={`filter-btn ${!showInactivos ? "filter-btn--active" : ""}`}
                    onClick={() => setShowInactivos(false)}
                >
                    <MdOutlineGroup /> Activos ({activos})
                </button>
                <button
                    className={`filter-btn filter-btn--inactive-tab ${showInactivos ? "filter-btn--active" : ""}`}
                    onClick={() => setShowInactivos(true)}
                >
                    <MdOutlinePersonOff /> Inactivos ({inactivos.length})
                </button>
            </div>

            {!showInactivos ? (
                <Table
                    items={teachers}
                    columns={COLUMNS}
                    entityLabel="docente"
                    onDelete={handleDesactivar}
                    loading={loading}
                    error={error}
                    renderRow={(teacher, setDeleteTarget) => (
                        <UserRow
                            key={teacher.id}
                            user={teacher}
                            badge={teacher.materia}
                            idPrefix="T-"
                            onDelete={setDeleteTarget}
                            onEdit={setEditTeacher}
                        />
                    )}
                />
            ) : (
                <Table
                    items={inactivos}
                    columns={COLUMNS}
                    entityLabel="docente"
                    emptyMessage="No hay docentes inactivos en esta sesión."
                    onDelete={handleReactivar}
                    renderRow={(teacher, setDeleteTarget) => (
                        <UserRow
                            key={teacher.id}
                            user={teacher}
                            badge={teacher.materia}
                            idPrefix="T-"
                            onDelete={setDeleteTarget}
                            onEdit={undefined}
                        />
                    )}
                />
            )}

            {openModal && (
                <UserModal tipo="DOCENTE" onClose={() => setOpenModal(false)} onSuccess={fetchData} />
            )}
            {editTeacher && (
                <EditUserModal
                    user={editTeacher}
                    onClose={() => setEditTeacher(null)}
                    onSuccess={() => { setEditTeacher(null); fetchData(); }}
                />
            )}
        </div>
    );
}