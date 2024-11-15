// InputField.jsx

const InputField = ({
  id,
  label,
  type,
  value,
  onChange,
  placeholder,
  ariaRequired,
  ariaInvalid,
}) => (
  <div className="form-group">
    <label htmlFor={id} className="label">
      {label}
    </label>
    <input
      type={type}
      id={id}
      className="input"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      aria-required={ariaRequired}
      aria-invalid={ariaInvalid}
      required
    />
  </div>
);

export default InputField;
