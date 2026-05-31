import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "../../pages/MainPage/MainPage.css";

export default function MainLayout() {
    return (
        <div className="Main-layout">

            <Sidebar />

            <div className="content">
                <Topbar />

                <div className="main-content">
                    <Outlet />
                </div>

            </div>

        </div>
    );
}