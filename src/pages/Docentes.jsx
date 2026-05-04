import React from "react";
import "../styles/Docentes.css";
import {
  FaSearch,
  FaBell,
  FaCog,
  FaChalkboardTeacher,
  FaUserGraduate,
  FaBook,
  FaUsers,
  FaUserPlus,
  FaCheckCircle,
  FaEdit,
  FaTrash,
  FaQuestionCircle,
  FaSignOutAlt,
} from "react-icons/fa";

export default function Docentes() {
  const docentes = [
    {
      foto: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?cs=srgb&dl=pexels-pixabay-415829.jpg&fm=jpg",
      nombre: "Elena Rodríguez",
      id: "T-2024-001",
      materia: "Matemáticas",
      correo: "elena.rodriguez@escuelaviva.edu",
      estado: "Activo",
    },
    {
      foto: "https://digital.uva.es/wp-content/uploads/2023/01/8adb1e6b-8152-47f9-8714-b2d7e9ed7198.jpeg",
      nombre: "Julián Soto",
      id: "T-2024-002",
      materia: "Biología",
      correo: "julian.soto@escuelaviva.edu",
      estado: "Activo",
    },
    {
      foto: "https://b2472105.smushcdn.com/2472105/wp-content/uploads/2024/07/Cristy-Palacios-2024-09164-1-1920x2399.jpg?lossy=1&strip=1&webp=1",
      nombre: "Clara Méndez",
      id: "T-2024-005",
      materia: "Historia",
      correo: "clara.mendez@escuelaviva.edu",
      estado: "Inactivo",
    },
  ];

  return (
    <div className="docentes-page">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo-box">
          <div className="logo-circle">
            <FaBook />
          </div>
          <div>
            <h2>Virtual Campus</h2>
            <p>GESTIÓN ACADÉMICA</p>
          </div>
        </div>

        <nav className="menu">
          <button className="menu-item">
            <FaUsers /> Principal
          </button>

          <button className="menu-item active">
            <FaChalkboardTeacher /> Docentes
          </button>

          <button className="menu-item">
            <FaUserGraduate /> Estudiantes
          </button>

          <button className="menu-item">
            <FaBook /> Materias
          </button>

          <button className="menu-item">
            <FaUsers /> Cursos
          </button>
        </nav>

        <div className="sidebar-bottom">
          <button className="menu-item secondary">
            <FaQuestionCircle /> Ayuda
          </button>

          <button className="menu-item secondary">
            <FaSignOutAlt /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="content">
        <header className="topbar">
          <h1>Campus Virtual</h1>

          <div className="top-actions">
            <div className="search-box">
              <FaSearch />
              <input type="text" placeholder="Buscar docente..." />
            </div>

            <FaBell className="icon" />
            <FaCog className="icon" />

            <img
              src="https://randomuser.me/api/portraits/men/20.jpg"
              alt="user"
              className="avatar"
            />
          </div>
        </header>

        {/* Hero */}
        <section className="hero">
          <div className="hero-text">
            <h2>
              Gestión de <span>Docentes</span>
            </h2>
            <p>
              Bienvenido al panel central de profesores. Aquí puedes administrar
              el equipo académico de <strong>Escuela Viva.</strong>
            </p>
          </div>

          <button className="btn-new">
            <FaUserPlus /> Añadir Nuevo Docente
          </button>
        </section>

        {/* Cards */}
        <section className="cards">
          <div className="card white">
            <div className="circle blue">
              <FaUsers />
            </div>
            <div>
              <p>Total Docentes</p>
              <h3>10</h3>
            </div>
          </div>

          <div className="card green">
            <div className="circle darkgreen">
              <FaCheckCircle />
            </div>
            <div>
              <p>Docentes Activos</p>
              <h3>9</h3>
            </div>
          </div>

          <div className="card yellow">
            <div className="circle gold">
              <FaBook />
            </div>
            <div>
              <p>Materias Cubiertas</p>
              <h3>10</h3>
            </div>
          </div>
        </section>

        {/* Table */}
        <section className="table-box">
          <table>
            <thead>
              <tr>
                <th>FOTO/NOMBRE</th>
                <th>MATERIA ASIGNADA</th>
                <th>CORREO</th>
                <th>ESTADO</th>
                <th>ACCIONES</th>
              </tr>
            </thead>

            <tbody>
              {docentes.map((docente, index) => (
                <tr key={index}>
                  <td className="teacher-cell">
                    <img src={docente.foto} alt="docente" />
                    <div>
                      <h4>{docente.nombre}</h4>
                      <p>ID: {docente.id}</p>
                    </div>
                  </td>

                  <td>
                    <span className={`tag ${docente.materia.toLowerCase()}`}>
                      {docente.materia}
                    </span>
                  </td>

                  <td>{docente.correo}</td>

                  {/* 🔥 CAMBIO AQUÍ */}
                  <td className={`estado ${docente.estado.toLowerCase()}`}>
                    <span className="dot"></span>
                    {docente.estado}
                  </td>

                  <td className="acciones">
                    <FaEdit className="edit" />
                    <FaTrash className="delete" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="table-footer">
            <p className="results-text">
              Mostrando 3 de 42 docentes
            </p>

            <div className="pagination">
              <button className="page-btn">‹</button>
              <button className="page-number active">1</button>
              <button className="page-number">2</button>
              <button className="page-number">3</button>
              <button className="page-btn">›</button>
            </div>
          </div>
        </section>

        <p className="copyright">
          © 2024 Escuela Viva - Sistema de Gestión Académica Premium
        </p>
      </main>
    </div>
  );
}