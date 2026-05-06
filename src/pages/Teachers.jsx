import { useEffect, useState } from "react";
import api from "../api/api";

import StatCard from "../components/dashboard/StatCard";
import TeacherTable from "../components/teachers/TeacherTable";
import Button from "../components/Button";

import { FaUsers } from "react-icons/fa6";
import { FaRegCircleCheck } from "react-icons/fa6";
import { MdMenuBook } from "react-icons/md";
import { HiOutlineUserAdd } from "react-icons/hi";


import "../styles/Teachers.css";

export default function TeachersPage() {
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    api.get("/users?tipo=DOCENTE")
      .then(res => setTeachers(res.data))
      .catch(err => console.error(err));
  }, []);

  const total = teachers.length;
  const activos = teachers.filter(t => t.activo).length;

  return (
    <div className="Teachers-page">
      {/* HEADER */}
      <div className="header-row">
        <div>
          <h1>
            Gestión de <span>Docentes</span>
          </h1>
          <p>Bienvenido al panel central de profesores. Aquí puedes administrar el equipo <br />
          académico de <span>Escuela Viva</span>.</p>
        </div>

        <Button text="Añadir Nuevo Docente" />
      </div>

      {/* STATS */}

      <div className="cards">
        <StatCard
          title="Total Docentes"
          value={total}
          color="default"
          icon={FaUsers}
          valueColor="#2A3031"
          titleColor="#575C5E"
          subColor="#a6d4fa"
          iconColor="#FFFFFF"
          iconStyle={{
            fontSize: "1.6rem",
            background: "#0284c7",
            padding: "12px",
            borderRadius: "50%",
            width: "52px",
            height: "52px",
          }}
        />

        <StatCard
          title="Docentes Activos"
          value={activos}
          color="green"
          icon={FaRegCircleCheck}
          valueColor="#2A3031"
          titleColor="#d4f8e8"
          subColor="#aef1d2"
          iconColor="#FFFFFF"
          iconStyle={{
            fontSize: "1.6rem",
            background: "#3C6600",
            padding: "12px",
            borderRadius: "50%",
            width: "52px",
            height: "52px",
          }}
        />

        <StatCard
          title="Materias Cubiertas"
          value="10"
          color="yellow"
          icon={MdMenuBook}
          valueColor="#2A3031"
          titleColor="#5C4900"
          subColor="#7a6300"
          iconColor="#463600"
          iconStyle={{
            fontSize: "1.6rem",
            background: "#EEC540",
            padding: "12px",
            borderRadius: "50%",
            width: "52px",
            height: "52px",
          }}
        />
      </div>


      {/* TABLA */}
      <TeacherTable teachers={teachers} />
    </div>
  );
}