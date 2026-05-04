import "../../styles/Dashboard.css";

export default function TeacherProgress({ name, subject, progress }) {
    return (
        <div className="teacher-card">

            {/* INFO */}
            <div className="teacher-info">
                <div className="teacher-avatar">
                    {name.charAt(0)}
                </div>

                <div>
                    <p className="teacher-name">{name}</p>
                    <span className="teacher-subject">{subject}</span>
                </div>
            </div>

            {/* PROGRESS */}
            <div className="teacher-progress">
                <div className="progress-bar">
                    <div
                        className="progress-fill"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>

                <span className="progress-text">{progress}%</span>
            </div>

        </div>
    );
}