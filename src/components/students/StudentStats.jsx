export default function StudentStats() {
    return (
        <div className="students-stats">
            <div className="stat-box">
                <p>Total Alumnos</p>
                <h2>47</h2>
            </div>

            <div className="stat-box green">
                <p>Activos</p>
                <h2>43</h2>
            </div>

            <div className="stat-box yellow">
                <p>En Trámite</p>
                <h2>4</h2>
            </div>
        </div>
    );
}