import TeacherRow from "./TeacherRow";

export default function TeacherTable({ teachers }) {

    return (
        <div className="table-container">

            <div className="table-header">
                <span>Foto/Nombre</span>
                <span>Materia</span>
                <span>Correo</span>
                <span>Estado</span>
                <span>Acciones</span>
            </div>

            {teachers.map((t) => (
                <TeacherRow key={t.id} teacher={t} />
            ))}

        </div>
    );
}