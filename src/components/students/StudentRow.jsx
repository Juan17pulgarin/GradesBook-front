import { FaUserLargeSlash } from "react-icons/fa6";

export default function StudentRow({ student }) {
    return (
        <div className="student-row">
            <div className="student-info">
                <div className="avatar"></div>
                <span>{student.name}</span>
            </div>

            <span>{student.grade}</span>
            <span>{student.tutor}</span>

            <span className={`status ${student.status}`}>
                {student.status}
            </span>

            <div className="actions">
                <button className="btn-edit" title="Editar">
                    <FiEdit2 />
                </button>
                <button className="btn-delete" title="Eliminar">
                    <FiTrash2 />
                </button>
            </div>
        </div>
    );
}