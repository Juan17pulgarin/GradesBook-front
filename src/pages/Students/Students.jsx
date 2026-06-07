import { useEffect, useState } from "react";

import { getUsers, deactivateUser } from "../../services/userService";
import { getEnrollments } from "../../services/enrollmentService";

import StatCard from "../../components/Cards/StatCard";
import Table from "../../components/Table/Table";
import UserRow from "../../components/Table/UserRow";
import UserModal from "../../components/Modal/UserModal";
import EditUserModal from "../../components/Modal/EditUserModal";

import { FaUsers, FaRegCircleCheck } from "react-icons/fa6";
import { HiOutlineEllipsisHorizontalCircle } from "react-icons/hi2";
import { RiUserAddLine } from "react-icons/ri";

import "./Students.css";

const COLUMNS = ["Estudiante", "Documento", "Correo", "Curso", "Estado", "Acciones"];

export default function Students() {
    const [students, setStudents] = useState([]);
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [editStudent, setEditStudent] = useState(null);

    const fetchStudents = () => {
        setLoading(true);
        Promise.all([
            getUsers("ESTUDIANTE"),
            getEnrollments(),
        ])
            .then(([studentsRes, enrollmentsRes]) => {
                setStudents(studentsRes.data);
                setEnrollments(enrollmentsRes.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setError(true);
                setLoading(false);
            });
    };

    useEffect(() => { fetchStudents(); }, []);

    const getCurso = (studentId) => {
        const enrollment = enrollments.find((e) => e.estudiante_id === studentId);
        return enrollment?.cursos?.nombre || "Sin curso";
    };

    const handleToggleActive = async (student) => {
        await deactivateUser(student.id);
        if (student.activo === false) {
            // Reactivado: refrescar desde el back
            fetchStudents();
        } else {
            // Desactivado: marcar localmente para que siga visible
            setStudents((prev) =>
                prev.map((s) => s.id === student.id ? { ...s, activo: false } : s)
            );
        }
    };

    const total = students.length;
    const activos = students.filter((s) => s.activo !== false).length;
    const inactivos = students.filter((s) => s.activo === false).length;

    return (
        <div className="students">
            <div className="students-header">
                <div>
                    <h1>Gestión de <span>Estudiantes</span></h1>
                    <p>
                        Administra el padrón de alumnos del colegio. Matricula nuevos integrantes y <br />
                        mantén actualizada la información de contacto y académica.
                    </p>
                </div>
                <button className="login-btn" onClick={() => setOpenModal(true)}>
                    <RiUserAddLine /> Añadir Nuevo Estudiante
                </button>
            </div>

            <div className="cards">
                <StatCard title="Total Alumnos" value={total} color="default" icon={FaUsers}
                    valueColor="#2A3031" titleColor="#575C5E" iconColor="#00618F"
                    iconStyle={{ background: "#CCEFFF", padding: "12px", borderRadius: "50%", width: "52px", height: "52px" }}
                />
                <StatCard title="Activos" value={activos} color="green" icon={FaRegCircleCheck}
                    valueColor="#2A3031" titleColor="#575C5E" iconColor="#396100"
                    iconStyle={{ background: "#C1FD7C", padding: "12px", borderRadius: "50%", width: "52px", height: "52px" }}
                />
                <StatCard title="Inactivos" value={inactivos} color="yellow" icon={HiOutlineEllipsisHorizontalCircle}
                    valueColor="#2A3031" titleColor="#575C5E" iconColor="#5C4900"
                    iconStyle={{ background: "#FDD34D", padding: "12px", borderRadius: "50%", width: "52px", height: "52px" }}
                />
            </div>

            <Table
                items={students}
                columns={COLUMNS}
                entityLabel="estudiante"
                onDelete={handleToggleActive}
                loading={loading}
                error={error}
                renderRow={(student, setDeleteTarget) => (
                    <UserRow
                        key={student.id}
                        user={student}
                        badge={student.documento}
                        extraCol={getCurso(student.id)}
                        onDelete={setDeleteTarget}
                        onEdit={setEditStudent}  // ← agregar
                    />
                )}
            />

            {openModal && (
                <UserModal tipo="ESTUDIANTE" onClose={() => setOpenModal(false)} onSuccess={fetchStudents} />
            )}

            {editStudent && (                                     // ← agregar
                <EditUserModal
                    user={editStudent}
                    onClose={() => setEditStudent(null)}
                    onSuccess={() => { setEditStudent(null); fetchStudents(); }}
                />
            )}
        </div>
    );
}