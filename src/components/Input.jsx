export default function Input({
  label,
  type = "text",
  placeholder,
  name,
  value,
  onChange
}) {
  return (
    <div className="input-group">
      <label>{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        name={name}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}