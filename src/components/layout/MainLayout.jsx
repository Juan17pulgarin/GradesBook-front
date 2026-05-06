import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "../../styles/MainLayout.css";

export default function MainLayout() {
    return (
        <div className="Main-page">
            <div className="Main-layout">

                <Sidebar />

                <div className="content">
                    <Topbar />

                    <div className="main-content">
                        <Outlet /> {/* 🔥 ESTA ES LA CLAVE */}
                    </div>

                </div>

            </div>
        </div>
    );
}