import { useEffect, useState } from "react";
import api from "../../api/api";

import StatCard from "../../components/Cards/StatCard";
import Table from "../../components/Table/Table";
import UserRow from "../../components/Table/UserRow";
import UserModal from "../../components/Modal/UserModal";

import { FaUsers, FaRegCircleCheck } from "react-icons/fa6";
import { HiOutlineEllipsisHorizontalCircle } from "react-icons/hi2";
import { RiUserAddLine } from "react-icons/ri";

import "./Students.css";

const COLUMNS = ["Estudiante", "Documento", "Correo", "Curso", "Acciones"];

export default function Students() {
    const [students, setStudents] = useState([]);
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [openModal, setOpenModal] = useState(false);

    const fetchStudents = () => {
        setLoading(true);
        Promise.all([
            api.get("/users?tipo=ESTUDIANTE"),
            api.get("/enrollments"),
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

    const handleDelete = async (student) => {
        await api.patch(`/users/${student.id}`);
        fetchStudents();
    };

    const total = students.length;
    const activos = students.filter((s) => s.activo).length;
    const inactivos = students.filter((s) => !s.activo).length;

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
                onDelete={handleDelete}
                loading={loading}
                error={error}
                renderRow={(student, setDeleteTarget) => (
                    <UserRow
                        key={student.id}
                        user={student}
                        badge={student.documento}
                        extraCol={getCurso(student.id)}
                        onDelete={setDeleteTarget}
                    />
                )}
            />

            {openModal && (
                <UserModal tipo="ESTUDIANTE" onClose={() => setOpenModal(false)} onSuccess={fetchStudents} />
            )}
        </div>
    );
}
