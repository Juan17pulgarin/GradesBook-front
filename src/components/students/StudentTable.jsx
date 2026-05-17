import StudentRow from "./StudentRow";

export default function StudentTable() {
    const students = [
        {
            name: "Sofía García López",
            grade: "5° Primaria",
            tutor: "Martín García",
            status: "activo",
        },
        {
            name: "Mateo Ramírez Ruiz",
            grade: "2° Primaria",
            tutor: "Elena Ruiz",
            status: "activo",
        },
        {
            name: "Valentina Costa",
            grade: "Egresado",
            tutor: "Lucía Mendoza",
            status: "inactivo",
        },
    ];

    return (
        <div className="student-table">
            <div className="table-header">
                <span>Estudiante</span>
                <span>Grado</span>
                <span>Tutor</span>
                <span>Estado</span>
                <span>Acciones</span>
            </div>

            {students.map((s, i) => (
                <StudentRow key={i} student={s} />
            ))}
        </div>
    );
}