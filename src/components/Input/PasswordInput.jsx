import { useState } from "react";

import { FaEye } from "react-icons/fa";

export default function PasswordInput({
    label,
    name,
    value,
    onChange
}) {
    const [show, setShow] = useState(false);

    return (
        <div className="input-group password-container">

            <div className="password-header">
                <label>{label}</label>
            </div>

            <div className="input-container">

                <input
                    type={show ? "text" : "password"}
                    placeholder="*******"
                    name={name}
                    value={value}
                    onChange={onChange}
                />

                <FaEye
                    className="icon"
                    onClick={() => setShow(!show)}
                />
            </div>

        </div>
    );
}