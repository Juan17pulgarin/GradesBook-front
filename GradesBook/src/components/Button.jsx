export default function Button({ text, onClick, type = "button" }) {
    return (
        <button className="login-btn" onClick={onClick} type={type}>
            {text}
        </button>
    );
}