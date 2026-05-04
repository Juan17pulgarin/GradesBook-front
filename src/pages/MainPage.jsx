import React from "react";
import "../styles/MainPage.css";

export default function Main() {

  const teachers = [
    {
      name: "Profe. Mariana Silva",
      subject: "Historia • 3er Año A, B",
      progress: 100,
      img: "https://www.ifoto.ai/_nuxt/img/demo_2_2.6df7940.webp",
    },
    {
      name: "Profe. Ricardo Méndez",
      subject: "Física • 4to Año C",
      progress: 85,
      img: "https://i.pravatar.cc/60?img=12",
    },
    {
      name: "Profe. Clara Ortiz",
      subject: "Matemáticas • 1er Año A, B, C",
      progress: 42,
      img: "https://conimagenes.com/wp-content/uploads/2023/04/Formal.jpg",
    },
    {
      name: "Profe. Alberto Gómez",
      subject: "Lenguaje • 5to Año A",
      progress: 95,
      img: "https://static.vecteezy.com/system/resources/previews/001/131/187/large_2x/serious-man-portrait-real-people-high-definition-grey-background-photo.jpg",
    },
  ];

  // 🔥 FUNCIÓN PARA COLORES AUTOMÁTICOS
  const getColor = (value) => {
    if (value >= 90) return "blue";     // 90 - 100
    if (value >= 70) return "yellow";   // 70 - 89
    return "red";                       // menos de 70
  };

  return (
    <div className="main-page">

      {/* Sidebar */}
      <aside className="sidebar">

        <div className="brand">
          <div className="brand-circle"></div>
          <div>
            <h2>Virtual Campus</h2>
            <p>GESTIÓN ACADÉMICA</p>
          </div>
        </div>

        <nav className="menu">
          <button className="menu-item active"> Principal</button>
          <button className="menu-item">Docentes</button>
          <button className="menu-item">Estudiantes</button>
          <button className="menu-item">Materias</button>
          <button className="menu-item">Cursos</button>
        </nav>

        <div className="sidebar-bottom">
          <button className="new-btn">
            Nuevo Registro
          </button>

          <button className="bottom-link">
            ❔ Ayuda
          </button>

          <button className="bottom-link">
            ↪ Cerrar Sesión
          </button>
        </div>

      </aside>

      {/* Content */}
      <main className="content">

        {/* Topbar */}
        <header className="topbar">
          <h1 className="logo-title">GradesBook</h1>

          <div className="top-actions">
            <input
              type="text"
              placeholder="Buscar alumnos, profesores..."
              className="search"
            />

            <span className="icon">🔔</span>
            <span className="icon">⚙️</span>

            <img
              src="https://i.pravatar.cc/45?img=15"
              alt="user"
              className="avatar"
            />
          </div>
        </header>

        {/* Welcome */}
        <section className="hero">
          <h2>Monitor Académico</h2>
          <p>
            Revisa el progreso de carga de notas del segundo bimestre y el
            rendimiento general de la institución.
          </p>
        </section>

        {/* Cards */}
        <section className="cards">
          <div className="card white">
            <span className="badge blue">+0.4 vs mes ant.</span>
            <p>Promedio General</p>
            <h3>8.7</h3>
          </div>

          <div className="card green">
            <span className="badge green-badge">En tiempo</span>
            <p>% de Notas Cargadas</p>
            <h3>92%</h3>
          </div>
        </section>

        {/* Teachers */}
        <section className="teachers-section">
          <div className="section-header">
            <h2>Progreso por Docente</h2>
            <a href="/">Ver todos</a>
          </div>

          <div className="teacher-list">
            {teachers.map((teacher, index) => (
              <div className="teacher-card" key={index}>
                <div className="teacher-info">
                  <img src={teacher.img} alt="teacher" />
                  <div>
                    <h4>{teacher.name}</h4>
                    <p>{teacher.subject}</p>
                  </div>
                </div>

                <div className="progress-area">
                  <span>Completado {teacher.progress}%</span>

                  <div className="progress-bar">
                    <div
                      className={`progress-fill ${getColor(teacher.progress)}`}
                      style={{ width: `${teacher.progress}%` }}
                    ></div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        </section>

        {/* META */}
        <section className="goal-card">
          <p className="goal-small">Objetivo del Mes</p>
          <h2>Cierre del 2do Bimestre</h2>

          <div className="goal-info">
            <span className="percent">74%</span>
            <span className="days">Faltan 6 días</span>
          </div>

          <div className="goal-bar">
            <div className="goal-fill"></div>
          </div>
        </section>

      </main>
    </div>
  );
}