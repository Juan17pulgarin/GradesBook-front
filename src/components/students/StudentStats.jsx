import StatCard from "../dashboard/StatCard";
import { FaUsers, FaRegCircleCheck } from "react-icons/fa6";
import { HiOutlineEllipsisHorizontalCircle } from "react-icons/hi2";

export default function StudentStats({ total, activos, inactivos }) {
    return (
        <div className="cards">
            <StatCard
                title="Total Alumnos"
                value={total}
                color="default"
                icon={FaUsers}
                valueColor="#2A3031"
                titleColor="#575C5E"
                iconColor="#00618F"
                iconStyle={{
                    background: "#CCEFFF",
                    padding: "12px",
                    borderRadius: "50%",
                    width: "52px",
                    height: "52px"
                }}
            />

            <StatCard
                title="Activos"
                value={activos}
                color="green"
                icon={FaRegCircleCheck}
                valueColor="#2A3031"
                titleColor="#575C5E"
                iconColor="#396100"
                iconStyle={{
                    background: "#C1FD7C",
                    padding: "12px",
                    borderRadius: "50%",
                    width: "52px",
                    height: "52px"
                }}
            />

            <StatCard
                title="Inactivos"
                value={inactivos}
                color="yellow"
                icon={HiOutlineEllipsisHorizontalCircle}
                valueColor="#2A3031"
                titleColor="#575C5E"
                iconColor="#5C4900"
                iconStyle={{
                    background: "#FDD34D",
                    padding: "12px",
                    borderRadius: "50%",
                    width: "52px",
                    height: "52px"
                }}
            />
        </div>
    );
}