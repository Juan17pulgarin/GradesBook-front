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

import "./Teachers.css";

const COLUMNS = ["Foto/Nombre", "Materia Asignada", "Correo", "Acciones"];

export default function TeachersPage() {
    const [teachers, setTeachers] = useState([]);
    const [totalMaterias, setTotalMaterias] = useState(0);
    const [openModal, setOpenModal] = useState(false);
    const [editTeacher, setEditTeacher] = useState(null);

    const fetchData = () => {
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
                        materia: subject?.nombre || "Sin asignar",
                        load_id: load?.id || null,
                    };
                });

                setTeachers(enriched);
                setTotalMaterias(subjects.length);
            })
            .catch((err) => console.error("Error:", err));
    };

    useEffect(() => { fetchData(); }, []);

    const handleDelete = async (teacher) => {
        await deactivateUser(teacher.id);
        fetchData();
    };

    const total = teachers.length;
    const activos = teachers.filter((t) => t.activo !== false).length;

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
                <StatCard title="Total Docentes" value={total} color="default" icon={FaUsers}
                    valueColor="#2A3031" titleColor="#575C5E" iconColor="#FFFFFF"
                    iconStyle={{ fontSize: "1.6rem", background: "#0284c7", padding: "12px", borderRadius: "50%", width: "52px", height: "52px" }}
                />
                <StatCard title="Docentes Activos" value={activos} color="green" icon={FaRegCircleCheck}
                    valueColor="#2A3031" titleColor="#d4f8e8" iconColor="#FFFFFF"
                    iconStyle={{ fontSize: "1.6rem", background: "#3C6600", padding: "12px", borderRadius: "50%", width: "52px", height: "52px" }}
                />
                <StatCard title="Materias Cubiertas" value={totalMaterias} color="yellow" icon={MdMenuBook}
                    valueColor="#2A3031" titleColor="#5C4900" iconColor="#463600"
                    iconStyle={{ fontSize: "1.6rem", background: "#EEC540", padding: "12px", borderRadius: "50%", width: "52px", height: "52px" }}
                />
            </div>

            <Table
                items={teachers}
                columns={COLUMNS}
                entityLabel="docente"
                onDelete={handleDelete}
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
