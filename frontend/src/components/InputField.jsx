// InputField.jsx

import PropTypes from 'prop-types';

const InputField = ({
  id,
  label,
  type,
  value,
  onChange,
  placeholder,
  ariaRequired = false,
  ariaInvalid = false,
  error = "",
}) => (
  <div className="form-group">
    <label htmlFor={id} className="label">
      {label}
      {ariaRequired && <span className="required-asterisk">*</span>}
    </label>
    <input
      type={type}
      id={id}
      name={id}
      className={`input ${error ? 'input-error' : ''}`}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      aria-required={ariaRequired}
      aria-invalid={ariaInvalid}
      aria-describedby={error ? `${id}-error` : undefined}
      required={ariaRequired}
    />
    {error && (
      <span id={`${id}-error`} className="error-message" role="alert">
        {error}
      </span>
    )}
  </div>
);

InputField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  ariaRequired: PropTypes.bool,
  ariaInvalid: PropTypes.bool,
  error: PropTypes.string,
};

export default InputField;
