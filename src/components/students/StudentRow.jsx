import { FiTrash2 } from "react-icons/fi";

export default function StudentRow({ student, onDelete, getCurso }) {
    return (
        <div className="table-row">
            <div className="student-info">
                <img src="https://i.pravatar.cc/40" alt="avatar" />
                <div>
                    <strong>{student.nombres} {student.apellidos}</strong>
                    <p>ID: {student.id}</p>
                </div>
            </div>

            <span className="badge">{student.documento}</span>

            <span>{student.email}</span>

            <span className="badge">{getCurso(student.id)}</span>


            <div className="actions">
                <button
                    className="btn-delete"
                    title="Eliminar"
                    onClick={() => onDelete(student)}
                >
                    <FiTrash2 />
                </button>
            </div>
        </div>
    );
}