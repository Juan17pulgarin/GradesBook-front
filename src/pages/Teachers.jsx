import { useEffect, useState } from "react";
import api from "../api/api";

import StatCard from "../components/dashboard/StatCard";
import TeacherTable from "../components/Teachers/TeacherTable";
import UserModal from "../components/UserModal";

import { FaUsers, FaRegCircleCheck } from "react-icons/fa6";
import { MdMenuBook } from "react-icons/md";

import "../styles/Teachers.css";

export default function TeachersPage() {
  const [teachers, setTeachers] = useState([]);
  const [totalMaterias, setTotalMaterias] = useState(0);
  const [openModal, setOpenModal] = useState(false);

  const fetchData = () => {
    Promise.all([
      api.get("/users?tipo=DOCENTE"),
      api.get("/academic-loads"),
      api.get("/subjects"),
    ])
      .then(([teachersRes, loadsRes, subjectsRes]) => {
        const loads = loadsRes.data;
        const subjects = subjectsRes.data;

        const enriched = teachersRes.data.map((t) => {
          const load = loads.find((l) => l.docente_id === t.id);
          const subject = load ? subjects.find((s) => s.id === load.materia_id) : null;
          return { ...t, materia: subject?.nombre || "Sin asignar" };
        });

        setTeachers(enriched);
        setTotalMaterias(subjects.length);
      })
      .catch((err) => console.error("Error:", err));
  };

  useEffect(() => { fetchData(); }, []);

  const total = teachers.length;
  const activos = teachers.filter((t) => t.activo).length;

  return (
    <div className="Teachers-page">
      <div className="header-row">
        <div>
          <h1>Gestión de <span>Docentes</span></h1>
          <p>Bienvenido al panel central de profesores. Aquí puedes administrar el equipo <br />
          académico de <span>Escuela Viva</span>.</p>
        </div>
        <button className="login-btn" onClick={() => setOpenModal(true)}>Añadir Nuevo Docente</button>
      </div>

      <div className="cards">
        <StatCard title="Total Docentes"
          value={total}
          color="default"
          icon={FaUsers}
          valueColor="#2A3031"
          titleColor="#575C5E"
          iconColor="#FFFFFF"
          iconStyle={{
            fontSize: "1.6rem",
            background: "#0284c7",
            padding: "12px",
            borderRadius: "50%",
            width: "52px",
            height: "52px"
          }} />

        <StatCard title="Docentes Activos"
          value={activos}
          color="green"
          icon={FaRegCircleCheck}
          valueColor="#2A3031"
          titleColor="#d4f8e8"
          iconColor="#FFFFFF"
          iconStyle={{
            fontSize: "1.6rem",
            background: "#3C6600",
            padding: "12px",
            borderRadius: "50%",
            width: "52px",
            height: "52px"
          }} />

        <StatCard title="Materias Cubiertas"
          value={totalMaterias}
          color="yellow"
          icon={MdMenuBook}
          valueColor="#2A3031"
          titleColor="#5C4900"
          iconColor="#463600"
          iconStyle={{
            fontSize: "1.6rem",
            background: "#EEC540",
            padding: "12px",
            borderRadius: "50%",
            width: "52px",
            height: "52px"
          }} />
      </div>

      <TeacherTable teachers={teachers} onRefresh={fetchData} />

      {openModal && (
        <UserModal tipo="DOCENTE" onClose={() => setOpenModal(false)} onSuccess={fetchData} />
      )}
    </div>
  );
}