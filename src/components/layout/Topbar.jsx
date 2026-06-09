import { FaSearch } from "react-icons/fa";
import UserAvatar from "../Avatar/UserAvatar";
import "./MainLayout.css";

export default function Topbar() {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const primerNombre = user.nombres?.split(" ")[0] || user.nombre?.split(" ")[0] || "U";

    return (
        <div className="topbar">
            <div className="topbar-left">
                <h2>GradesBook</h2>
            </div>
            <div className="topbar-right">
                <div className="search-box">
                    <FaSearch className="search-icon" />
                    <input type="text" placeholder="Buscar alumnos, profesores..." />
                </div>
                <div className="avatar">
                    <UserAvatar nombre={primerNombre} size={36} fontSize="0.875rem" />
                </div>
            </div>
        </div>
    );
}