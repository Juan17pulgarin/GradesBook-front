export default function StatCard({
<<<<<<< HEAD
    title, value, subtitle, color = "default", badge,
    icon: Icon, textColor, titleColor, valueColor, subColor, iconColor, iconStyle,
}) {
    return (
        <div className={`stat-card ${color}`} style={{ color: textColor }}>

            {/* Fila superior: ícono izq, badge der */}
            <div className="stat-header">
                {Icon && (
                    <Icon
                        className="stat-icon"
                        style={{ color: iconColor, ...iconStyle }}
                    />
                )}
                {badge && <span className="stat-badge">{badge}</span>}
            </div>

            {/* Fila inferior: título y valor */}
            <div className="stat-text">
                <p className="stat-title" style={{ color: titleColor }}>
                    {title}
                </p>
                <h2 className="stat-value" style={{ color: valueColor }}>
                    {value}
                </h2>
                {subtitle && (
                    <span className="stat-sub" style={{ color: subColor }}>
=======
    title,
    value,
    subtitle,
    color = "default",
    badge,
    icon: Icon,
    textColor,
    titleColor,
    valueColor,
    subColor,
    iconColor,
    iconStyle,
}) {
    return (
        <div
            className={`stat-card ${color}`}
            style={{ color: textColor }}
        >
            {badge && <span className="stat-badge">{badge}</span>}

            <div className="stat-content1">
                <div className="stat-header">

                    {Icon && (
                        <Icon
                            className="stat-icon"
                            style={{ color: iconColor, ...iconStyle }}
                        />
                    )}

                    <p
                        className="stat-title"
                        style={{ color: titleColor }}
                    >
                        {title}
                    </p>

                </div>

                <h2
                    className="stat-value"
                    style={{ color: valueColor }}
                >
                    {value}
                </h2>

                {subtitle && (
                    <span
                        className="stat-sub"
                        style={{ color: subColor }}
                    >
>>>>>>> courses-subject
                        {subtitle}
                    </span>
                )}
            </div>
<<<<<<< HEAD

=======
>>>>>>> courses-subject
        </div>
    );
}