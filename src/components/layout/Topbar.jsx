import { FaSearch, FaBell, FaCog } from "react-icons/fa";
import "../../styles/MainLayout.css";

export default function Topbar() {
    return (
        <div className="topbar">

            {/* TÍTULO */}
            <div className="topbar-left">
                <h2>GradesBook</h2>
            </div>

            {/* DERECHA */}
            <div className="topbar-right">

                {/* BUSCADOR */}
                <div className="search-box">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Buscar alumnos, profesores..."
                    />
                </div>

                {/* AVATAR */}
                <div className="avatar">
                    <img
                        src="https://i.pravatar.cc/40"
                        alt="user"
                    />
                </div>

            </div>
        </div>
    );
}