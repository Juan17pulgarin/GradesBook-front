export default function TeacherRow({ teacher }) {

    return (
        <div className="table-row">

            <div className="name">
                <img src="https://i.pravatar.cc/40" alt="avatar" />

                <div>
                    <p>{teacher.nombres} {teacher.apellidos}</p>
                    <span>ID: {teacher.id}</span>
                </div>
            </div>

            <span className="badge blue">
                {teacher.materia || "Sin asignar"}
            </span>

            <span>{teacher.correo}</span>

            <span className={teacher.activo ? "active" : "inactive"}>
                ● {teacher.activo ? "Activo" : "Inactivo"}
            </span>

            <div className="actions">
                ✏️ 🗑️
            </div>

        </div>
    );
}