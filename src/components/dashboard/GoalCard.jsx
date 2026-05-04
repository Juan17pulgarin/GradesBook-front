import "../../styles/Dashboard.css";

export default function GoalCard({ title, percent, subtitle }) {
    return (
        <div className="goal-card">

            {/* TEXTO */}
            <div className="goal-info">
                <h3>{title}</h3>
                <p>{subtitle}</p>
            </div>

            {/* CÍRCULO */}
            <div className="goal-circle">
                <div className="circle">
                    <span>{percent}%</span>
                </div>
            </div>

        </div>
    );
}