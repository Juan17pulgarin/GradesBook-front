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
import { MdOutlinePersonOff, MdOutlineGroup } from "react-icons/md";

import "./Students.css";

const COLUMNS = ["Estudiante", "Documento", "Correo", "Curso", "Acciones"];

export default function Students() {
    const [students, setStudents] = useState([]);
    const [inactivos, setInactivos] = useState([]);
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [editStudent, setEditStudent] = useState(null);
    const [showInactivos, setShowInactivos] = useState(false);

    const fetchStudents = () => {
        setLoading(true);
        Promise.all([
            getUsers("ESTUDIANTE"),
            getEnrollments(),
        ])
            .then(([studentsRes, enrollmentsRes]) => {
                const enrolls = enrollmentsRes.data;
                const backIds = new Set(studentsRes.data.map((s) => s.id));
                setInactivos((prev) => prev.filter((s) => !backIds.has(s.id)));
                
                const enriched = studentsRes.data.map((s) => {
                    const enrollment = enrolls.find((e) => e.estudiante_id === s.id);
                    return {
                        ...s,
                        activo: true,
                        curso: enrollment?.cursos?.nombre || "Sin curso"
                    };
                });
                
                setStudents(enriched);
                setEnrollments(enrolls);
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
        const student = students.find((s) => s.id === studentId);
        return student?.curso || "Sin curso";
    };

    const handleDesactivar = async (student) => {
        await deactivateUser(student.id, false);
        setStudents((prev) => prev.filter((s) => s.id !== student.id));
        setInactivos((prev) => [...prev, { ...student, activo: false }]);
    };

    const handleReactivar = async (student) => {
        await deactivateUser(student.id, true);
        setInactivos((prev) => prev.filter((s) => s.id !== student.id));
        fetchStudents();
    };

    const total   = students.length + inactivos.length;
    const activos = students.length;

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
                <StatCard 
                title="Total Alumnos" 
                value={total} 
                color="default" icon={FaUsers}
                valueColor="#2A3031" 
                titleColor="#575C5E" 
                iconColor="#00618F"
                iconStyle={{ background: "#CCEFFF", 
                    padding: "12px", 
                    borderRadius: "50%", 
                    width: "52px", 
                    height: "52px" }}
                />
                <StatCard 
                title="Activos" 
                value={activos} 
                color="green" 
                icon={FaRegCircleCheck}
                valueColor="#2A3031" 
                titleColor="#575C5E" 
                iconColor="#396100"
                iconStyle={{ background: "#C1FD7C", 
                    padding: "12px", 
                    borderRadius: "50%", 
                    width: "52px", 
                    height: "52px" }}
                />
                <StatCard 
                title="Inactivos" 
                value={inactivos.length} 
                color="yellow"
                icon={HiOutlineEllipsisHorizontalCircle}
                valueColor="#2A3031" 
                titleColor="#575C5E" 
                iconColor="#5C4900"
                iconStyle={{ background: "#FDD34D", 
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
                    key="activos"
                    items={students}
                    columns={COLUMNS}
                    entityLabel="estudiante"
                    onDelete={handleDesactivar}
                    loading={loading}
                    error={error}
                    renderRow={(student, setDeleteTarget) => (
                        <UserRow
                            key={student.id}
                            user={student}
                            badge={student.documento}
                            extraCol={getCurso(student.id)}
                            onDelete={setDeleteTarget}
                            onEdit={setEditStudent}
                        />
                    )}
                />
            ) : (
                <Table
                    key="inactivos"
                    items={inactivos}
                    columns={COLUMNS}
                    entityLabel="estudiante"
                    emptyMessage="No hay estudiantes inactivos en esta sesión."
                    onDelete={handleReactivar}
                    renderRow={(student, setDeleteTarget) => (
                        <UserRow
                            key={student.id}
                            user={student}
                            badge={student.documento}
                            extraCol={getCurso(student.id)}
                            onDelete={setDeleteTarget}
                            onEdit={undefined}
                        />
                    )}
                />
            )}

            {openModal && (
                <UserModal tipo="ESTUDIANTE" onClose={() => setOpenModal(false)} onSuccess={fetchStudents} />
            )}
            {editStudent && (
                <EditUserModal
                    user={editStudent}
                    onClose={() => setEditStudent(null)}
                    onSuccess={() => { setEditStudent(null); fetchStudents(); }}
                />
            )}
        </div>
    );
}