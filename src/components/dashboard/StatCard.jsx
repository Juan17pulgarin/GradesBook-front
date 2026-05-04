import "../../styles/Dashboard.css";

import { FaArrowTrendUp } from "react-icons/fa6";

export default function StatCard({
    title,
    value,
    subtitle,
    color = "default",
    badge,
}) {
    return (
        <div className={`stat-card ${color}`}>

            {/* BADGE ARRIBA */}
            {badge && <span className="stat-badge">{badge}</span>}

            {/* CONTENIDO */}
            <div className="stat-content1">
                <FaArrowTrendUp />
                <p className="stat-title">{title}</p>
                <h2 className="stat-value">{value}</h2>
                {subtitle && <span className="stat-sub">{subtitle}</span>}
            </div>

        </div>
    );
}